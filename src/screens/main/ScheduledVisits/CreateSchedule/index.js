import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  TextInput,
  ScrollView,
  Image,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { NavigationHeader, DropDown } from '../../../../components';
import { theme } from '../../../../theme';
import { icons } from '../../../../assets';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { api } from '../../../../api';
import { AppConstants, getTOffset, StorageUtils } from '../../../../utils';
import Spinner from 'react-native-loading-spinner-overlay';
import Snackbar from 'react-native-snackbar';
import ConnectyCube from 'react-native-connectycube';
import { styles } from './styles';
import axios from 'axios';
import { getLocalProfile } from '../../../../utils/fetcher';
import { Icon } from '../../../../components/elements';
import { colors } from 'react-native-elements';
import { externalInviteUrl } from '../../../../api/apiURL';


const TextinputField = props => {
  return (
    <>
      <Text style={styles.itemTitleStyle}>{props.title}</Text>
      <TextInput
        style={[theme.palette.textInputRoundBg, styles.followupTextStyle]}
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
      <Text style={styles.itemTitleStyle}>{props.title}</Text>
      <DropDown
        textStyle={{ color: '#000' }}
        placeholderStyle={styles.placeholderStyle}
        style={styles.dropDownContainer}
        data={props.data}
        placeholder={props.placeholder}
        value={props.value}
        {...props}
      />
    </>
  );
};

export class AddSchedule extends Component {
  constructor(props) {
    super();
    this.state = {
      visitDetails: '',
      inviteUser: [],
      pinCode: '',
      date: '',
      time: '',
      duration: '',
      callType: '',
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      spinner: false,
      registerUserModal: false,
      registertedList: [],
      selectedItems: [],
      userData: {},
      createdForUserId: '',
      createdForEmail: '',
      userType: '',
    };
  }
  getTimeOffset = date => {
    const { offset, offsetTime } = getTOffset(date);
    return offsetTime;
  };
  async componentDidMount() {
    this.setState({ userData: await getLocalProfile() });

    this.getRegistertedSeniorList();
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

  getRegistertedSeniorList = async () => {
    const role = await StorageUtils.getValue(AppConstants.SP.ROLE);
    this.setState({ userType: role });
    let requestApi = api.getRegistertedSeniors;
    if (this.state.userType === 'senior') {
      requestApi = api.getRegistertedCaregivers;
    }
    try {
      this.setState({ spinner: true });
      await axios
        .get(requestApi)
        .then(res => {
          if (res?.data != null && res?.data?.length > 0) {
            this.setState({ registertedList: res?.data });
          }
          this.setState({ spinner: false });
        })
        .catch(err => {
          this.setState({ spinner: false });
          this.showError();
        });
    } catch (err) {
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

  addRegistertedEmail = () => {
    this.setState({ registerUserModal: false });
    let selectedRow = [];

    const { selectedItems, registertedList } = this.state;
    for (let index of selectedItems) {
      const registertedEmail = {
        // meetingRoomId: 0, //handle by backend
        userId:
          this.state.userType === 'senior'
            ? registertedList[index].careGiverId.toString()
            : registertedList[index].seniorId.toString(),
        userName: registertedList[index].firstName,
        email: registertedList[index].email,
        isVideoAllowed: true,
        isMicAllowed: true,
        isFileAllowed: true,
        callerId: registertedList[index].callerId,
        // offSetHours: null, //handle by backend
        userType: 1,
      };

      this.setState({
        createdForUserId:
          this.state.userType === 'senior'
            ? registertedList[index].careGiverId
            : registertedList[index].seniorId,
      });
      this.setState({ createdForEmail: registertedList[index].email });

      selectedRow.push(registertedEmail);
    }
    //console.log(this.state.createdForUserId, this.state.createdForEmail);
    this.setState({
      inviteUser: selectedRow,
      registerUserModal: false,
    });
  };

  selectedItems = index => {
    this.setState({ selectedItems: [index] });
  };

  registerUserModal = () => {
    const { selectedItems } = this.state;
    return (
      <Modal visible={this.state.registerUserModal} transparent={true}>
        <View style={styles.modalView}>
          <View style={[styles.modalContanier]}>
            <View style={styles.headerContainer}>
              <Text style={styles.selectContactStyle}>Select Contact</Text>
            </View>
            <FlatList
              data={this.state.registertedList}
              keyExtractor={item => item?.callerId}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={
                    selectedItems.includes(index)
                      ? styles.selectedRow
                      : styles.unselectedRow
                  }
                  onPress={() => this.selectedItems(index)}>
                  <Image
                    source={
                      item.profileImage
                        ? { uri: item.profileImage }
                        : icons.tab_profile
                    }
                    style={styles.imageStyle}
                  />

                  <View>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: 'bold',
                      }}>{`${item.firstName} ${item.lastName}`}</Text>
                    <View style={styles.onlineOfflineStatusContainer}>
                      <Text style={styles.StatusText}>Status:</Text>
                      <Text
                        style={
                          item.isOnline
                            ? styles.onlineStatusText
                            : styles.offlineStatusText
                        }>
                        {item.isOnline ? 'Online' : 'Offline'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            <View style={styles.modalBtnContainer}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#BDBDBD' }]}
                onPress={() => this.setState({ registerUserModal: false })}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#00AEEF' }]}
                onPress={() => {
                  this.addRegistertedEmail();
                }}>
                <Text style={styles.modalBtnText}>Invite</Text>
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
  updateAlluserList = (list, pinCode, confRoomId) => {
    allUsersList = list.map(obj => ({
      ...obj,
      pin: pinCode,
      meetingRoomId: confRoomId,
    }));
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
    let allUsersList = [{}];
    let connectyUsers = [];
    allUsersList = inviteUser.map(obj => ({
      ...obj,
      pin: pinCode,
    }));
    // console.log('this.state.userData.userId', this.state.userData.userId);
    allUsersList = [
      ...allUsersList,
      {
        // meetingRoomId: 0, handle onbackEnd
        userId: this.state.userData.userId,
        userName: this.state.userData.FIRST_NAME,
        email: this.state.userData.EMAIL,
        pin: pinCode,
        isVideoAllowed: true,
        isMicAllowed: true,
        isFileAllowed: true,
        callerId: this.state.userData.callerId,
        // offSetHours: 'string', handle onbackEnd
        userType: 1,
      },
    ];
    if (allUsersList.length > 0) {
      connectyUsers = allUsersList.map(obj => ({
        id: parseInt(obj.callerId),
        email: obj.email,
      }));
    }
    const params = {
      name: 'My Meeting',
      start_date: new Date().getTime(),
      end_date: new Date('2021/09/05').getTime(),
      attendees: connectyUsers.map(user => user),
      record: false,
      chat: false,
    };
    ConnectyCube.createSession({ login: 'kerako', password: 'test1234' }).then(
      async () => {
        await ConnectyCube.meeting
          .create(params)
          .then(async meeting => {
            let confRoomId = meeting._id;
            if (confRoomId) {
              const datad = {
                connectyCubeMeetingId: confRoomId,
                meetingRoomId: confRoomId,
                visitDetail: visitDetails,
                meetingType: 1,
                meetingLink: externalInviteUrl(pinCode),
                pin: pinCode,
                createdByEmail: this.state.userData.EMAIL,
                createdForUserId: this.state.createdForUserId,
                createdForEmail: this.state.createdForEmail,
                meetingStatus: 1,
                meetingDuration: duration,
                meetingCallType: callType == '1' ? 1 : 2,
                meetingDateTime: this.combineDateTimeFormate(date, time),
                meetingUsers: allUsersList,
              };
              debugger;
              await axios
                .post(api.meetingRequest, datad)
                .then(() => {
                  Snackbar.show({
                    text: 'Schedule visit is saved',
                    duration: Snackbar.LENGTH_SHORT,
                  });

                  this.props.navigation.goBack();
                  this.setState({ spinner: false });
                })
                .catch(error => {
                  this.setState({ spinner: false });
                });
            }
          })
          .catch(error => {
            this.setState({ spinner: false });
          });
      },
    );
  };

  codeGenerator = () => {
    const dd = Math.random()
      .toString(36)
      .slice(2);
    this.setState({ pinCode: dd });
  };
  InvitedUserItemViewer = item => {
    return (
      <View style={styles.invitedUserListItemStyle}>
        <View style={styles.dateIconContainer}>
          <Text style={styles.invitedUserTextStyle} numberOfLines={1}>
            {item.email}
          </Text>
          <Icon
            name="close"
            onPress={() => this.setState({ inviteUser: [] })}
            size={22}
            color={colors.error}
            containerStyle={{ marginEnd: 10 }}
          />
        </View>
      </View>
    );
  };
  OpenModal = () => {
    if (this.state.inviteUser.length > 0) {
      Snackbar.show({
        text:
          'At creation of schedule call you can only add 1 user.First delete the already added one ',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    this.setState({ registerUserModal: true });
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
          title={'Scheduled Visit'}
          leftText={'Back'}
          navigation={this.props.navigation}
        />
        <Spinner
          visible={this.state.spinner}
          textStyle={styles.spinnerTextStyle}
        />
        <View style={styles.subContainer}>
          {this.registerUserModal()}
          <ScrollView style={styles.scrollViewStyle} nestedScrollEnabled={true}>
            <TextinputField
              title="Visit Details"
              placeholder="Follow up Visit"
              value={visitDetails}
              onChangeText={visitDetails => {
                this.setState({ visitDetails });
              }}
            />
            <Text style={styles.itemTitleStyle}>Invited Users</Text>
            <View style={styles.InvitedUserFlatlistContainer}>
              {this.state.inviteUser.length > 0 ? (
                <FlatList
                  nestedScrollEnabled
                  contentContainerStyle={styles.flatlistContainer}
                  data={this.state.inviteUser}
                  renderItem={({ item, index }) => {
                    return this.InvitedUserItemViewer(item);
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

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                this.OpenModal();
              }}
              style={styles.inviteBtn}>
              <Text style={{ color: 'white' }}>Select Contacts</Text>
            </TouchableOpacity>

            <Text style={styles.itemTitleStyle}>Pin Code</Text>
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
            <Text style={styles.itemTitleStyle}>Select Date</Text>

            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateIconContainer}
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
            <Text style={styles.itemTitleStyle}>Select Time</Text>
            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateIconContainer}
                onPress={() => {
                  this.setState({ isTimePickerVisible: true });
                }}>
                <Text
                  style={{
                    ...styles.input,
                    ...{ color: time == '' ? 'rgba(0,0,0,0.2)' : 'black' },
                  }}>
                  {time != '' ? time : '09:00 AM'}
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
            <TouchableOpacity
              onPress={() => {
                this.validate();
                //this.saveCallSchedule();
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
