import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { NavigationHeader } from '../../../components';
import { theme } from '../../../theme';
import { ScrollView } from 'react-native-gesture-handler';
import Spinner from 'react-native-loading-spinner-overlay';
import { api } from '../../../api';
import { getTOffset, showMessage } from '../../../utils';
import Snackbar from 'react-native-snackbar';
import axios from 'axios';
import { scheduleCallDetailStyle as styles } from './style';
import { Icon } from '../../../components/elements';
import { getLocalProfile } from '../../../utils/fetcher';
import { EventRegister } from 'react-native-event-listeners';
const RenderData = ({ title, value }) => {
  return (
    <Text style={{ marginTop: 20 }}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{value}</Text>
    </Text>
  );
};
const CRUDButton = props => {
  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: props.bgColor }]}
      onPress={props.onPress}>
      <Text style={styles.btnText}>{props.title}</Text>
    </TouchableOpacity>
  );
};
export class ScheduleCallDetails extends Component {
  constructor(props) {
    super();
    this.state = {
      confirmModal: false,
      spinner: false,
      activeSection: props.navigation.getParam('activeSection'),
      item: props.navigation.getParam('item'),
      userData: {},
    };
  }
  async componentDidMount() {
    this.setState({ spinner: true });
    this.setState({ userData: await getLocalProfile() });
    this.setState({ spinner: false });
  }
  showError = () => {
    this.setState({ spinner: false });

    Snackbar.show({
      text: 'Error',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  // Delete Schedule call
  onDelete = async () => {
    this.setState({ confirmModal: false });
    const { navigation } = this.props;
    this.setState({ spinner: true });
    //    const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
    try {
      this.setState({ spinner: true });
      await axios
        .delete(`${api.deleteScheduleCall}/${this.state.item.id}`)
        .then(res => {
          this.setState({ spinner: false });
          Snackbar.show({
            text: 'Meeting has been deleted successfully',
            duration: Snackbar.LENGTH_SHORT,
          });
          navigation.navigate('ScheduleCall', { navigation: navigation });
        })
        .catch(err => {
          this.setState({ spinner: false });
          this.showError();
        });
    } catch (err) {
      this.setState({ spinner: false });
      Snackbar.show({
        text: 'Error in deleting schedule Call',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };
  onBackPress = () => {
    const { navigation } = this.props;
    navigation.goBack();
  };
  // Confirm Delete Schedule call Modal
  confirmModal = () => {
    return (
      <Modal visible={this.state.confirmModal} transparent={true}>
        <View style={styles.modalView}>
          <View style={styles.modalContanier}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Alert</Text>
            </View>
            <View style={styles.inviteEmailContainer}>
              <Text style={styles.modalText}>
                Are you sure you want to delete the following visit:
              </Text>

              <Text style={[styles.modalHeaderText, { marginTop: 20 }]}>
                {this.getTimeOffset(this.state.item.meetingDateTime).format(
                  'Do MMM, yyy',
                )}
              </Text>
              <Text style={styles.modalHeaderText}>
                Duration: {this.state.item.meetingDuration + ' mins'}
                {/* {this.time(item.meetingDateTime)} -{' '}
                {this.time(item.meetingExpireDatetime)} */}
              </Text>
            </View>
            <View style={[styles.modalBtnContainer, { padding: 20 }]}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#BDBDBD' }]}
                onPress={() => this.setState({ confirmModal: false })}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#00AEEF' }]}
                onPress={this.onDelete}>
                <Text style={styles.modalBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  getTimeOffset = date => {
    const { offset, offsetTime } = getTOffset(date);
    return offsetTime;
  };
  ParticipantView = item => {
    const videopermision = item.isVideoAllowed ? 'video-call' : 'videocam-off';
    const micPermission = item.isMicAllowed ? 'mic' : 'mic-off';
    const fillPermission = item.isFileAllowed ? 'attachment' : 'block';

    return (
      <View style={styles.participantContainer}>
        <Text style={styles.visitDetailStyle} numberOfLines={1}>
          {item.email}
        </Text>
        <View style={styles.iconContainer}>
          <View style={styles.iconbg}>
            <Icon
              name={micPermission}
              type="material"
              color="white"
              size={20}
            />
          </View>
          <View style={styles.iconbg}>
            <Icon
              name={videopermision}
              color="white"
              type="material"
              size={20}
            />
          </View>
          {/* <View style={styles.iconbg}>
            <Icon
              name={fillPermission}
              color="white"
              type="material"
              size={20}
            />
          </View> */}
        </View>
      </View>
    );
  };
  updateScheduleCallStatus = async status => {
    this.setState({ spinner: true });
    let roomId = this.state.item.meetingUsers[0].meetingRoomId;
    if (roomId) {
      let uri = String(api.updateScheduleCallStatus).replace(
        '{meetingRoomId}',
        roomId,
      );
      uri = uri.replace('{id}', status);
      const body = {
        meetingRoomId: roomId,
        meetingStatus: status,
      };
      try {
        await axios
          .put(uri)
          .then(res => {
            if (res?.data != null) {
              this.setState({ spinner: false });
              setTimeout(() => {
                Snackbar.show({
                  text: 'Status has been updated',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }, 100);
              this.props.navigation.goBack();
            }
          })
          .catch(err => {
            this.setState({ spinner: false });
            setTimeout(() => {
              Snackbar.show({
                text: err?.description,
                duration: Snackbar.LENGTH_SHORT,
              });
            }, 100);
          });
      } catch (error) {
        this.setState({ spinner: false });
        setTimeout(() => {
          Snackbar.show({
            text: 'Something went wrong. Try Again',
            duration: Snackbar.LENGTH_SHORT,
          });
        }, 100);
      }
    } else {
      this.setState({ spinner: false });
      setTimeout(() => {
        Snackbar.show({
          text: 'Missing Meeting Room Id',
          duration: Snackbar.LENGTH_SHORT,
        });
      }, 100);
    }
  };
  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Spinner
          visible={this.state.spinner}
          textStyle={styles.spinnerTextStyle}
        />
        <NavigationHeader
          onBackButtonPress={() => this.onBackPress()}
          title={'Details'}
          leftText={'Back'}
          navigation={this.props.navigation}
        />
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: theme.colors.white,
          }}>
          <View style={{ marginBottom: 20 }}>
            {this.confirmModal()}
            <ScrollView>
              <View style={styles.inerContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {this.state.item.visitDetail}
                </Text>
                <Text style={styles.dateTimeStyle}>
                  {this.getTimeOffset(this.state.item.meetingDateTime).format(
                    'ddd, Do MMM h:mm a ',
                  )}

                  {/* {this.getTimeOffset(this.state.item.meetingExpireDatetime).format(
                  ' h:mm a',
                )} */}
                </Text>
                <RenderData
                  title={'Organizer: '}
                  value={this.state.item.firstName}
                />

                <RenderData
                  title={'Duration: '}
                  value={this.state.item.meetingDuration + ' mins'}
                />
                <RenderData
                  title={'Call Type: '}
                  value={
                    this.state.item.meetingCalltype == 1 ? 'Video' : 'Audio'
                  }
                />
                {/* <RenderData
              title={'End Date: '}
              value={this.getTimeOffset(item.meetingExpireDatetime).format(
                'ddd, Do MMM h:mm a',
              )}
            /> */}
                <Text style={styles.participantTextStyle}>Participants</Text>
                {this.state.item?.meetingUsers?.length > 0 ? (
                  <FlatList
                    data={this.state.item.meetingUsers}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    numColumns={2}
                    renderItem={({ item }) => {
                      return this.ParticipantView(item);
                    }}
                    keyExtractor={(item, index) => index.toString()}
                  />
                ) : (
                  <Text style={styles.noParticipantStyle}>
                    No Participant added
                  </Text>
                )}
              </View>
              {/* approve and reject buttons */}
              {this.state.activeSection == 'pendingSection' &&
                this.state.item.createdBy != this.state.userData.userId && (
                  <View style={styles.btnContainer}>
                    <CRUDButton
                      title="Reject"
                      bgColor={theme.colors.red_shade_2}
                      onPress={() => {
                        this.updateScheduleCallStatus(3);
                      }}
                    />
                    <CRUDButton
                      title="Approve"
                      bgColor={theme.colors.colorPrimary}
                      onPress={() => {
                        this.updateScheduleCallStatus(2);
                      }}
                    />
                  </View>
                )}
              {this.state.activeSection == 'scheduledSection' && (
                <View style={styles.btnContainer}>
                  {(this.state.item.createdBy == this.state.userData.userId ||
                    this.state.item.createdForUserId ==
                    this.state.userData.userId) && (
                      <CRUDButton
                        title="Update"
                        bgColor={theme.colors.green_color}
                        onPress={() => {
                          this.props.navigation.navigate('ScheduleForm', {
                            visitData: { item: this.state.item, formType: 2 },
                          });
                        }}
                      />
                    )}
                  {<CRUDButton
                    title="Join"
                    bgColor={theme.colors.colorPrimary}
                    onPress={() => {
                      EventRegister.emit('onAppLogin', {
                        ...this.state.userData,
                      });

                      const currentMeetingRoomUser = this.state.item.meetingUsers.find(
                        item => {
                          if (item.email == this.state.userData.email)
                            return item;
                        },
                      );
                      setTimeout(() => {
                        this.props.navigation.navigate('VideoScreen', {
                          op: this.state.item,
                          currentMeetingRoomUser: currentMeetingRoomUser,
                        });
                      }, 300);
                    }}
                  />}
                </View>
              )}
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}
