import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';
import { NavigationHeader, DropDown, SearchBar } from '../../../components';
import { theme } from '../../../theme';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { api } from '../../../api';
import { getTOffset } from '../../../utils';
import Spinner from 'react-native-loading-spinner-overlay';
import Snackbar from 'react-native-snackbar';
import { DEFAULT_PASSWORD } from '../../../Connecty/config';
import ConnectyCube from 'react-native-connectycube';
import { styles } from './style';
import axios from 'axios';
import { getLocalProfile } from '../../../utils/fetcher';
import { Icon } from '../../../components/elements';
import colors from '../../../theme/colors';
import { externalInviteUrl } from '../../../api/apiURL';

const TextinputField = props => {
  return (
    <>
      <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 20 }}>
        {props.title}
      </Text>
      <TextInput
        style={[
          theme.palette.textInputRoundBg,
          { width: '100%', marginTop: 10, height: 50 },
        ]}
        placeholder={props.placeholder}
        placeholderTextColor={theme.colors.grey_shade_1}
        {...props}
        value={props.value}
      />
    </>
  );
};

const DropDownField = props => {
  return (
    <>
      <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 20 }}>
        {props.title}
      </Text>
      <DropDown
        textStyle={{ color: '#000' }}
        style={{
          width: '100%',
          borderRadius: 10,
          minHeight: 50,
          backgroundColor: theme.colors.grey_shade_4,
          marginTop: 10,
          paddingEnd: 10,
        }}
        data={props.data}
        placeholder={props.placeholder}
        value={props.value}
        {...props}
      />
    </>
  );
};

export class ScheduleForm extends Component {
  constructor(props) {
    super();
    this.state = {
      visitDetails: '',
      inviteUser: [],
      registerUsers: [],
      pinCode: '',
      date: '',
      time: '',
      duration: '',
      callType: '',
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      inviteModal: false,
      inviteEmail: '',
      externalUsersList: [],
      externalInvites: [],
      spinner: false,
      connectyRoomId: '',
      registerUserModal: false,
      registertedList: [],
      selectedItems: [],
      checkItme: {},
      userData: {},
      createdForEmail: '',
      createdByEmail: '',
      searchSpinner: false,
    };
  }

  getTimeOffset = date => {
    const { offset, offsetTime } = getTOffset(date);
    return offsetTime;
  };
  async componentDidMount() {
    this.setState({ userData: await getLocalProfile() });
    const { navigation } = this.props;
    const visData = navigation.getParam('visitData');
    console.log('visData', visData);
    this.setState({ visitDetails: visData.item.visitDetail });
    this.setState({ callType: visData.item.meetingCalltype });
    this.setState({ pinCode: visData.item.pin });
    this.setState({ duration: visData.item.meetingDuration });
    this.setState({ createdForEmail: visData.item.createdForEmail });
    this.setState({ createdByEmail: visData.item.createdByEmail });
    this.selectDate(new Date(this.getTimeOffset(visData.item.meetingDateTime)));
    this.selectTime(new Date(this.getTimeOffset(visData.item.meetingDateTime)));
    this.setState({ inviteUser: visData.item.meetingUsers });
    this.setState({ scheFormType: visData.formType });
    this.setState({ connectyRoomId: visData.item.connectyCubeMeetingId });
    this.getExternalUsersList();
  }

  onBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  showError = () => {
    this.setState({ spinner: false });
    Snackbar.show({
      text: 'Error',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  getAllRegisteredUsers = async str => {
    try {
      this.setState({ searchSpinner: true });
      const uri = String(api.allRegisteredUser).replace('{email}', str);
      await axios
        .get(uri)
        .then(res => {
          if (res?.data != null && res?.data?.length > 0) {
            this.setState({ registertedList: res?.data });
          }
          this.setState({ searchSpinner: false });
        })
        .catch(err => {
          this.setState({ searchSpinner: false });
          this.showError();
        });
    } catch (err) {
      this.showError();
    }
  };
  getExternalUsersList = async () => {
    try {
      this.setState({ spinner: true });
      await axios
        .get(api.getUnRegistertedUsers)
        .then(res => {
          console.log('external', JSON.stringify(res))
          if (res?.data != null && res?.data?.length > 0) {
            this.setState({ externalUsersList: res?.data });
          }
          this.setState({ spinner: false });
        })
        .catch(err => {
          this.setState({ spinner: false });
          this.showError();
        });
    } catch (err) {
      this.setState({ spinner: false });
      this.showError();
    }
  };

  selectDate = value => {
    const displayFormat = 'MM/DD/YYYY';
    let __date = moment(value); // converting the selected date as current date on utc 0, fixing time difference
    const _displayDate = __date.format(displayFormat);
    this.setState({ date: _displayDate, isDatePickerVisible: false });
  };

  selectTime = value => {
    this.setState({
      time: moment(value).format('hh:mm a'),
      isTimePickerVisible: false,
    });
  };

  addExternalEmail = async () => {

    const {
      inviteEmail,
      registertedList,
      inviteUser,
      externalUsersList,
      externalInvites,
      visitDetails, pinCode, date, time, duration, callType
    } = this.state;
    let externalEmailSuccess;

    const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    if (
      !inviteEmail.trim() ||
      !emailRegex.test(String(inviteEmail).toLowerCase())
    ) {
      Snackbar.show({
        text: 'Please enter valid email',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    var emailLength = inviteEmail.substring(0, inviteEmail.indexOf('@'));
    if (emailLength.length < 3) {
      Snackbar.show({
        text: 'Email must be at least 3 alphanumerics.',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }


    if (inviteUser.length >= 8) {
      Snackbar.show({
        text: 'Maximum users are invited',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    let alreadyExistUser = registertedList.filter(
      ruser => ruser.email.toLowerCase() === inviteEmail.toLowerCase(),
    );
    if (alreadyExistUser.length > 0) {
      Snackbar.show({
        text: 'This is a registered user, please choose different',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    console.log("invitedUsers", JSON.stringify(inviteUser))
    let alreadySelect = inviteUser.filter(
      aluser => aluser.email.toLowerCase() === inviteEmail.toLowerCase(),
    );
    if (alreadySelect.length > 0) {
      Snackbar.show({
        text: 'This user already selected, please choose different',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    let unRegisterUser =
      externalUsersList.length > 0 &&
      externalUsersList.filter(exuser => exuser.email.toLowerCase() == inviteEmail.toLowerCase());
    let externalEmail = {};

    if (unRegisterUser.length > 0) {
      externalEmail = {
        email: inviteEmail,
        callerId: unRegisterUser[0].callerId,
      };
      externalEmailSuccess = this.sendEmail(inviteEmail, unRegisterUser[0].callerId)
      if (externalEmail) {
        const inviteUser = [...this.state.inviteUser, externalEmail];
        this.setState({
          inviteUser,
          inviteModal: false,
          inviteEmail: '',
          externalInvites: [...externalInvites, externalEmail],
        });
      } else {
        this.setState({
          inviteModal: false,
          inviteEmail: '',
        });
      }
      return;
    } else {
      try {
        ConnectyCube.createSession({
          login: 'kerako',
          password: 'test1234'
        }).then(async () => {
          await ConnectyCube.users
            .get({ email: inviteEmail })
            .then(async (result) => {
              console.log("result", JSON.stringify(result))
              externalEmail = {
                userName: inviteEmail.split('@')[0],
                email: inviteEmail,
                userType: 2,
                callerId: result.user.id,
                isFileAllowed: true,
                isMicAllowed: true,
                isVideoAllowed: true,
              };
              const inviteUser = [...this.state.inviteUser, externalEmail];
              externalEmailSuccess = this.sendEmail(inviteEmail, result.user.id)
              if (externalEmailSuccess) {
                this.setState({
                  inviteUser,
                  inviteModal: false,
                  inviteEmail: '',
                  externalInvites: [...externalInvites, result.user.id],
                });
              } else {
                this.setState({
                  inviteModal: false,
                  inviteEmail: '',
                });
              }
              return;
            }).catch(async (e) => {
              result = await ConnectyCube.users
                .signup({
                  email: inviteEmail,
                  login: inviteEmail.split('@')[0],
                  password: DEFAULT_PASSWORD,
                })
                .then(result => {
                  console.log("result", JSON.stringify(result))
                  externalEmail = {
                    userName: inviteEmail.split('@')[0],
                    email: inviteEmail,
                    userType: 2,
                    callerId: result.user.id,
                    isFileAllowed: true,
                    isMicAllowed: true,
                    isVideoAllowed: true,
                  };
                  const inviteUser = [...this.state.inviteUser, externalEmail];
                  externalEmailSuccess = this.sendEmail(inviteEmail, result.user.id)
                  if (externalEmailSuccess) {
                    this.setState({
                      inviteUser,
                      inviteModal: false,
                      inviteEmail: '',
                      externalInvites: [...externalInvites, result.user.id],
                    });
                  } else {
                    this.setState({
                      inviteModal: false,
                      inviteEmail: '',
                    });
                  }
                  return;
                })
                .catch(error => {
                  // alert(JSON.stringify(error))
                  Snackbar.show({
                    text: 'Can not add this user as external user!',
                    duration: Snackbar.LENGTH_SHORT,
                  });
                  console.log('error', error);
                  return error.info;
                });
            })
        }).catch(() => {
        })
      } catch (error) {
        setTimeout(() => {
          Snackbar.show({
            text: 'Error in create Connectycube Account ',
            duration: Snackbar.LENGTH_SHORT,
          });
        }, 1000);
      }
      // if (result.errors) {
      //   let errString = '';
      //   for (let a in result.errors) {
      //     errString += result.errors[a].toString();
      //   }
      //   setTimeout(() => {
      //     Snackbar.show({
      //       text: errString,
      //       duration: Snackbar.LENGTH_SHORT,
      //     });
      //   }, 1000);
      // }
    }
  };

  sendEmail = (email, callerId) => {
    let randId = Math.random() * 100000;
    randId = Math.floor(randId);
    const {
      inviteEmail,
      registertedList,
      inviteUser,
      externalUsersList,
      externalInvites,
      visitDetails, pinCode, date, time, duration, callType
    } = this.state;
    const { navigation } = this.props;
    const visData = navigation.getParam('visitData');
    console.log("data", visData)
    const user = {
      userName: email.split('@')[0],
      email: email,
      userId: randId,
      id: randId,
      userType: 2,
      pin: pinCode,
      callerId: callerId,
      isFileAllowed: true,
      isMicAllowed: true,
      isVideoAllowed: true,
      isEditAllowed: false,
      offSetHours: new Date().getTimezoneOffset() / -60
    };
    let userList = [user]
    var callBody = JSON.stringify({
      connectyCubeMeetingId: this.state.connectyRoomId,
      meetingRoomId: this.state.connectyRoomId,
      visitDetail: visitDetails,
      meetingType: visData.item.meetingType,
      //for production build ,
      //meetingLink: `https://login.sensights.ai/meeting/external/${pinCode}`,
      //  for stage build
      meetingLink: externalInviteUrl(pinCode),
      meetingDuration: duration,
      meetingCallType: callType == '1' ? 1 : 2,
      meetingDateTime: visData.item.meetingDateTime,
      meetingUsers: userList,
      pin: pinCode
    });
    this.setState({ searchSpinner: true });
    axios
      .put(api.addMeetingUser + `/${visData.item.id}`, callBody)
      .then(response => {
        if (response && response.data && response.data.statusCode == 400) {
          Snackbar.show({
            text: response && response.data && response.data.message,
            duration: Snackbar.LENGTH_SHORT,
          });
          return false
        } else {
          Snackbar.show({
            text: 'Invitation sent to email',
            duration: Snackbar.LENGTH_SHORT,
          });
          this.setState({ searchSpinner: false });
          return true
        }
      })
      .catch(error => {
        Snackbar.show({
          text: 'Could not send the invite email!',
          duration: Snackbar.LENGTH_SHORT,
        });
        this.setState({ searchSpinner: false });
        return false
      });

  }

  inviteModal = () => {
    return (
      <Modal visible={this.state.inviteModal} transparent={true}>
        <View style={styles.modalView}>
          <View style={styles.modalContanier}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Invite User via Email</Text>
            </View>
            <View style={styles.inviteEmailContainer}>
              <Text style={styles.EmailTitleStyle}>Email:</Text>

              <TextInput
                style={styles.inviteEmail}
                placeholder={'External_User@email.com'}
                placeholderTextColor={theme.colors.grey_shade_1}
                value={this.state.inviteEmail}
                onChangeText={inviteEmail => {
                  this.setState({ inviteEmail });
                }}
              />
            </View>
            <View style={[styles.modalBtnContainer, { padding: 20 }]}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#BDBDBD' }]}
                onPress={() => this.setState({ inviteModal: false })}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#00AEEF' }]}
                onPress={() => this.addExternalEmail()}>
                <Text style={styles.modalBtnText}>Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  selectedItems = index => {
    const { selectedItems } = this.state;
    if (selectedItems.includes(index)) {
      selectedItems.splice(selectedItems.indexOf(index), 1);
      this.setState({
        selectedItems: [...selectedItems],
      });
    } else {
      this.setState({ selectedItems: [...selectedItems, index] });
    }
  };
  addUser = async item => {
    const { visitDetails, pinCode, date, time, duration, callType } = this.state;

    const registertedEmail = {
      userName: item?.firstName,
      email: item?.email,
      pin: pinCode,
      callerId: item?.callerId,
      userType: 1,
      isFileAllowed: true,
      isMicAllowed: true,
      isVideoAllowed: true,
    };
    const inviteUser = [...this.state.inviteUser, registertedEmail];
    debugger;
    if (inviteUser.length > 8) {
      Snackbar.show({
        text: 'Maximum users are invited',
        duration: Snackbar.LENGTH_SHORT,
      });
    } else {
      const { navigation } = this.props;
      const visData = navigation.getParam('visitData');
      var callBody = JSON.stringify({
        connectyCubeMeetingId: this.state.connectyRoomId,
        meetingRoomId: this.state.connectyRoomId,
        visitDetail: visitDetails,
        meetingType: 1,
        pin: pinCode,
        meetingDuration: duration,
        meetingCallType: callType == '1' ? 1 : 2,
        meetingDateTime: this.combineDateTimeFormate(date, time),
        meetingUsers: [registertedEmail],
      });
      try {
        this.setState({ searchSpinner: true });
        await axios
          .put(api.addMeetingUser + `/${visData.item.id}`, callBody)
          .then(res => {
            this.setState({ searchSpinner: false });
            this.setState({
              inviteUser,
            });

            Snackbar.show({
              text: 'User Successfully Added',
              duration: Snackbar.LENGTH_SHORT,
            });
            // this.props.navigation.navigate('ScheduleCall');
          })
          .catch(err => {
            this.setState({ searchSpinner: false });
            this.showError();
          });
      } catch (err) {
        this.setState({ searchSpinner: false });
        this.showError();
      }
    }
  };
  removeUser = async (item, index) => {
    const {
      visitDetails,
      pinCode,
      date,
      time,
      inviteUser,
      duration,
      callType,
    } = this.state;
    const registertedEmail = {
      userName: item?.userName,
      email: item?.email,
      pin: pinCode,
      callerId: item?.callerId,
      userType: 1,
      isFileAllowed: item.isFileAllowed,
      isMicAllowed: item.isMicAllowed,
      isVideoAllowed: item.isVideoAllowed,
    };
    debugger;
    const { navigation } = this.props;
    const visData = navigation.getParam('visitData');
    var callBody = JSON.stringify({
      connectyCubeMeetingId: this.state.connectyRoomId,
      meetingRoomId: this.state.connectyRoomId,
      visitDetail: visitDetails,
      meetingType: 1,
      pin: pinCode,
      meetingDuration: duration,
      meetingCallType: callType == '1' ? 1 : 2,
      meetingDateTime: this.combineDateTimeFormate(date, time),
      meetingUsers: [registertedEmail],
    });
    try {
      this.setState({ spinner: true });
      await axios
        .put(api.removeMeetingUser + `/${visData.item.id}`, callBody)
        .then(res => {
          inviteUser.splice(index, 1);
          this.setState({
            inviteUser: [...inviteUser],
          });
          this.setState({ spinner: false });
          Snackbar.show({
            text: 'User Successfully Removed',
            duration: Snackbar.LENGTH_SHORT,
          });
        })
        .catch(err => {
          this.setState({ spinner: false });
          this.showError();
        });
    } catch (err) {
      this.setState({ spinner: false });
      this.showError();
    }
  };
  RegisteredUserView = (item, index) => {
    return (
      <View style={styles.itemContainer}>
        {/* <Image
          source={
            item.profileImage ? {uri: item.profileImage} : icons.tab_profile
          }
          style={styles.imageStyle}
        /> */}
        <View style={styles.itemHeader}>
          <Text numberOfLines={1} style={styles.nameStyle}>
            {item.firstName + ' ' + item.lastName}
          </Text>
          <View
            style={item.isOnline ? styles.onlineView : styles.offlineView}
          />
        </View>
        <View>
          <Text style={styles.emailTextStyle} numberOfLines={1}>
            Email: {' ' + item.email}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => this.addUser(item)}
          style={styles.addbtn}>
          <Text style={{ color: 'white' }}>Add</Text>
        </TouchableOpacity>
      </View>
    );
  };
  registerUserModal = () => {
    return (
      <Modal visible={this.state.registerUserModal} transparent={true}>
        <View style={styles.modalView}>
          <View style={[styles.modalContanier]}>
            <View style={styles.headerContainer}>
              <Text style={styles.selectContactStyle}>Select Contact</Text>
            </View>

            <SearchBar searchFilter={val => this.getAllRegisteredUsers(val)} />
            <Spinner
              visible={this.state.searchSpinner}
              textStyle={styles.spinnerTextStyle}
            />
            <FlatList
              data={this.state.registertedList}
              renderItem={({ item, index }) => {
                return this.RegisteredUserView(item, index);
              }}
              style={{ flexGrow: 0, paddingVertical: 15 }}
            />
            <View
              style={[
                styles.modalBtnContainer,
                {
                  justifyContent: 'space-evenly',
                  marginTop: 15,
                  paddingBottom: 20,
                },
              ]}>
              {/* <TouchableOpacity
                style={[styles.modalBtn, {backgroundColor: '#BDBDBD'}]}
                onPress={() => this.setState({registerUserModal: false})}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#00AEEF' }]}
                onPress={() => {
                  this.setState({ registerUserModal: false });
                }}>
                <Text style={styles.modalBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  showError = () => {
    this.setState({ spinner: false });

    Snackbar.show({
      text: 'Error',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  validate = () => {
    const {
      visitDetails,
      inviteUser,
      pinCode,
      date,
      time,
      duration,
      callType,
    } = this.state;
    if (visitDetails == '')
      Snackbar.show({
        text: 'Please enter visit details',
        duration: Snackbar.LENGTH_SHORT,
      });
    else if (inviteUser.length == 0)
      Snackbar.show({
        text: 'Please enter atleast one inivite user',
        duration: Snackbar.LENGTH_SHORT,
      });
    else if (pinCode == '')
      Snackbar.show({
        text: 'Please enter pin code',
        duration: Snackbar.LENGTH_SHORT,
      });
    else if (date == '')
      Snackbar.show({
        text: 'Please enter visit date',
        duration: Snackbar.LENGTH_SHORT,
      });
    else if (time == '')
      Snackbar.show({
        text: 'Please enter visit time',
        duration: Snackbar.LENGTH_SHORT,
      });
    else if (duration == '')
      Snackbar.show({
        text: 'Please enter visit duration',
        duration: Snackbar.LENGTH_SHORT,
      });
    else if (callType == '')
      Snackbar.show({
        text: 'Please enter visit Type',
        duration: Snackbar.LENGTH_SHORT,
      });
    else this.saveCallSchedule();
  };

  combineDateTimeFormate = (date, time) => {
    const time24Formate = moment(time, ['h:mm A']).format('HH:mm');
    const dateFormate = moment(date).format('YYYY-MM-DD');
    const datetime = moment(
      dateFormate + time24Formate,
      'YYYY-MM-DDThh:mm:ss.SSSZ',
    );
    const dateobj = new Date(datetime._d);
    // Contents of above date object is
    // converted into a string using toISOString() method.
    const combineDateTime = moment(dateobj)
      .add(new Date(dateobj).getTimezoneOffset() / -60, 'hours')
      .toISOString();
    return combineDateTime;
  };

  saveCallSchedule = async () => {
    this.setState({ spinner: !this.state.spinner });
    const {
      visitDetails,
      inviteUser,
      pinCode,
      date,
      time,
      duration,
      callType,
    } = this.state;
    const { navigation } = this.props;
    const visData = navigation.getParam('visitData');
    let allUsersList = [{}];
    allUsersList = inviteUser.map(obj => ({
      userName: obj.userName || obj.email.split('@')[0],
      email: obj.email,
      pin: obj.pin ? obj.pin : pinCode,
      callerId: obj.callerId,
      userType: obj.userType,
      isFileAllowed: obj.isFileAllowed,
      isMicAllowed: obj.isMicAllowed,
      isVideoAllowed: obj.isVideoAllowed,
    }));

    var callBody = JSON.stringify({
      connectyCubeMeetingId: this.state.connectyRoomId,
      meetingRoomId: this.state.connectyRoomId,
      visitDetail: visitDetails,
      meetingType: 1,
      pin: pinCode,
      meetingDuration: duration,
      meetingCallType: callType == '1' ? 1 : 2,
      meetingDateTime: this.combineDateTimeFormate(date, time),
      meetingUsers: allUsersList,
    });
    try {
      this.setState({ spinner: true });
      await axios
        .put(api.updateScheduleCall + `/${visData.item.id}`, callBody)
        .then(res => {
          this.setState({ spinner: false });
          Snackbar.show({
            text: 'Schedule visit is saved',
            duration: Snackbar.LENGTH_SHORT,
          });
          this.props.navigation.navigate('ScheduleCall');
        })
        .catch(err => {
          this.setState({ spinner: false });
          this.showError();
        });
    } catch (err) {
      this.setState({ spinner: false });
      this.showError();
    }
  };

  renderinviteUser = () => {
    let value = '';
    const userlist = this.state.inviteUser;
    const registerList = this.state.registerUsers;

    for (let i = 0; i < userlist.length; i++) {
      value += `${userlist[i].email},\n`;
    }
    for (let i = 0; i < registerList.length; i++) {
      value += `${registerList[i].email},\n`;
    }
    return value;
  };
  codeGenerator = () => {
    const dd = Math.random()
      .toString(36)
      .slice(2);
    this.setState({ pinCode: dd });
  };
  InvitedUserItemViewer = (item, index) => {
    const { inviteUser } = this.state;
    const videopermision = item.isVideoAllowed ? 'video-call' : 'videocam-off';
    const micPermission = item.isMicAllowed ? 'mic' : 'mic-off';
    const fillPermission = item.isFileAllowed ? 'attachment' : 'block';
    return (
      <View style={styles.invitedUserListItemStyle}>
        <View style={styles.dateIconContainer}>
          <Text></Text>
          <Text style={styles.invitedUserTextStyle} numberOfLines={1}>
            {item.email}
          </Text>
          {item.email == this.state.createdByEmail ||
            item.email == this.state.createdForEmail ? (
            <Text></Text>
          ) : (
            <Icon
              name="close"
              onPress={() => this.removeUser(item, index)}
              size={22}
              color={colors.red_shade_1}
            // containerStyle={{marginEnd: 10}}
            />
          )}
        </View>
        <View style={styles.iconContainer}>
          <View style={styles.iconbg}>
            <Icon
              name={micPermission}
              onPress={() => {
                inviteUser[index].isMicAllowed = !inviteUser[index]
                  .isMicAllowed;
                this.setState({
                  inviteUser: [...inviteUser],
                });
              }}
              type="material"
              color="white"
              size={24}
            />
          </View>
          <View style={styles.iconbg}>
            <Icon
              onPress={() => {
                inviteUser[index].isVideoAllowed = !inviteUser[index]
                  .isVideoAllowed;
                this.setState({
                  inviteUser: [...inviteUser],
                });
              }}
              name={videopermision}
              color="white"
              type="material"
              size={24}
            />
          </View>
          {/* <View style={styles.iconbg}>
            <Icon
              onPress={() => {
                inviteUser[index].isFileAllowed = !inviteUser[index]
                  .isFileAllowed;
                this.setState({
                  inviteUser: [...inviteUser],
                });
              }}
              name={fillPermission}
              color="white"
              type="material"
              size={24}
            />
          </View> */}
        </View>
      </View>
    );
  };
  render() {
    const {
      visitDetails,
      pinCode,
      date,
      time,
      duration,
      callType,
      isDatePickerVisible,
      isTimePickerVisible,
    } = this.state;
    return (
      <SafeAreaView style={styles.container}>
        <NavigationHeader
          onBackButtonPress={() => this.onBackPress()}
          title={'Set up Scheduled Visit'}
          leftText={'Back'}
          navigation={this.props.navigation}
        />
        <Spinner
          visible={this.state.spinner}
          textStyle={styles.spinnerTextStyle}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: theme.colors.white,
            alignItems: 'center',
          }}>
          {this.inviteModal()}
          {this.registerUserModal()}
          <ScrollView
            style={{
              width: '100%',
            }}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled">
            <View style={{ width: '90%', marginTop: 30, alignSelf: 'center' }}>
              <TextinputField
                title="Visit Details"
                placeholder="Follow up Visit"
                value={visitDetails}
                onChangeText={visitDetails => {
                  this.setState({ visitDetails });
                }}
              />
              <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 20 }}>
                Invited Users
              </Text>
              <View style={styles.InvitedUserFlatlistContainer}>
                {this.state.inviteUser.length > 0 ? (
                  <FlatList
                    nestedScrollEnabled
                    contentContainerStyle={styles.flatlistContainer}
                    data={this.state.inviteUser}
                    renderItem={({ item, index }) => {
                      return this.InvitedUserItemViewer(item, index);
                    }}
                  />
                ) : (
                  <View style={styles.emptyInvitedUserList}>
                    <Text style={styles.emptyInvitedUserListText}>
                      List is empty
                    </Text>
                  </View>
                )}
              </View>

              <View
                style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    this.setState({ registerUserModal: true });
                  }}
                  style={styles.inviteBtn}>
                  <Text style={{ color: 'white' }}>Select Contacts</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    // alert('under Development');
                    if (this.state.inviteUser.length >= 8) {
                      Snackbar.show({
                        text: 'Maximum users are invited',
                        duration: Snackbar.LENGTH_SHORT,
                      });
                    } else {
                      this.setState({ inviteModal: true });
                    }
                  }}
                  style={styles.inviteBtn}>
                  <Text style={{ color: 'white' }}>Invite External</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 20 }}>
                Pin Code
              </Text>
              <View style={styles.genrateContainer}>
                <Text style={styles.codeTextStyle}>{pinCode}</Text>
                <TouchableOpacity
                  style={styles.genrateButtonContainer}
                  onPress={() => {
                    this.codeGenerator();
                  }}>
                  <Text style={styles.genrateText}>GENRATE</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 20 }}>
                Select Date
              </Text>

              <View
                style={{
                  borderRadius: 10,
                  paddingEnd: 10,
                  backgroundColor: theme.colors.grey_shade_4,
                  marginTop: 10,
                }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.setState({ isDatePickerVisible: true });
                  }}>
                  <Text
                    style={[
                      styles.input,
                      { color: date == '' ? 'rgba(0,0,0,0.2)' : 'black' },
                    ]}>
                    {date != ''
                      ? moment(date).format('Do MMM yyy')
                      : moment(new Date()).format('Do MMM yyy')}
                  </Text>
                  <Icon
                    name="angle-down"
                    type="font-awesome"
                    color="#999999"
                    size={20}
                  />
                </TouchableOpacity>
                <DateTimePickerModal
                  display="spinner"
                  mode={'date'}
                  minimumDate={new Date()}
                  isVisible={isDatePickerVisible}
                  onConfirm={value => {
                    this.selectDate(value);
                  }}
                  onCancel={() => this.setState({ isDatePickerVisible: false })}
                />
              </View>
              <Text style={{ fontWeight: 'bold', fontSize: 17, marginTop: 20 }}>
                Select Time
              </Text>
              <View
                style={{
                  borderRadius: 10,
                  paddingEnd: 10,
                  backgroundColor: theme.colors.grey_shade_4,
                  marginTop: 10,
                }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.setState({ isTimePickerVisible: true });
                  }}>
                  <Text style={styles.input}>
                    <Text
                      style={{ color: time == '' ? 'rgba(0,0,0,0.2)' : 'black' }}>
                      {time != '' ? time : '09:00 AM'}
                    </Text>
                  </Text>

                  <Icon
                    name="angle-down"
                    type="font-awesome"
                    color="#999999"
                    size={20}
                  />
                </TouchableOpacity>
                <DateTimePickerModal
                  display="spinner"
                  mode={'time'}
                  is24Hour={false}
                  isVisible={isTimePickerVisible}
                  onConfirm={value => {
                    this.selectTime(value);
                  }}
                  onCancel={() => this.setState({ isTimePickerVisible: false })}
                />
              </View>

              <DropDownField
                title="Duration"
                placeholder="30 mins"
                data={[
                  { value: 15, label: '15 mins' },
                  { value: 30, label: '30 mins' },
                  { value: 45, label: '45 mins' },
                  { value: 60, label: '60 mins' },
                ]}
                value={duration}
                onChange={(value, index, item) => {
                  this.setState({ duration: value });
                }}
              />
              <DropDownField
                title="Call Type"
                placeholder="Video"
                data={[
                  { value: '1', label: 'Video' },
                  { value: '2', label: 'Audio' },
                ]}
                value={callType}
                onChange={(value, index, item) => {
                  this.setState({ callType: value });
                }}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                this.validate();
              }}
              style={styles.scheduleBtn}>
              <Text style={[theme.palette.buttonText]}>Save Visit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
}
