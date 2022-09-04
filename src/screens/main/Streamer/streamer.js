import React from 'react';
import PropTypes from 'prop-types';
import {AppConstants, StorageUtils} from '../../../utils';
import {
  View,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  Text,
  Platform,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import ProgressBar from './bar';
import {NodeCameraView} from 'react-native-nodemediaclient';
import get from 'lodash/get';
import {LIVE_STATUS, videoConfig, audioConfig} from './utils/constants';
import SocketManager from './socketManager';
import styles from './styles';
import ChatInputGroup from './components/ChatInputGroup';
import MessagesList from './components/MessagesList/MessagesList';
import FloatingHearts from './components/FloatingHearts';
import {RTMP_SERVER} from './config';
import Logger from './utils/logger';
import {api} from '../../../api';
import {NavigationHeader, Row, Col} from '../../../components';
import Snackbar from 'react-native-snackbar';
import axios from 'axios';
import {icons} from '../../../assets';

// import { result } from 'lodash';
// import { theme } from "../../../../src";

// let { width, height } = Dimensions.get('window');

export default class Streamer extends React.Component {
  constructor(props) {
    super(props);
    const {route} = props;
    const roomName = props.navigation.getParam('userName', null);
    const userName = props.navigation.getParam('userName', null); //get(route, 'params.userName', '');

    this.state = {
      currentLiveStatus: LIVE_STATUS.PREPARE,
      messages: [],
      countHeart: 0,
      progress: 0,
      isVisibleMessages: true,
      serverStatus: false,
      setListener: false,
      valueGot: false,
      bpm: '',
      showButton: false,
      showNewButton: false,
      hrv: '',
      respRate: '',
      sat: '',
      // bp: '',
      systolic: '',
      diastolic: '',
      stress: '',
      data: '',
    };
    this.roomName = roomName;

    this.userName = userName;

    this.timeoutInstance = null;
  }

  async UNSAFE_componentWillMount() {
    console.log('COM WILL MOUNTTT');

    this.runTimer();
  }

  runTimer() {
    this.timerState = setInterval(() => {
      if (this.state.progress <= 0.95) {
        this.setState({
          progress:
            this.state.progress +
            Math.floor(Math.random() * 1) +
            Math.random() * 0.05 +
            0.01,
        });

        if (this.nodeCameraViewRef) this.nodeCameraViewRef.start();
        this.setState({currentLiveStatus: 1, showButton: false});
      } else {
        clearInterval(this.timerState);
      }
    }, 1700);

    this.timeoutInstance = setTimeout(() => {
      this.onPressLiveStreamButton();
    }, 1000);
  }

  async componentDidMount() {
    console.log('COM DID MOUNT');

    this.requestCameraPermission();

    SocketManager.instance.emitPrepareLiveStream({
      userName: this.userName,
      roomName: this.roomName,
    });

    SocketManager.instance.emitJoinRoom({
      userName: this.userName,
      roomName: this.roomName,
    });
    SocketManager.instance.listenBeginLiveStream(data => {
      const currentLiveStatus = get(data, 'liveStatus', '');
      this.setState({currentLiveStatus});
    });
    SocketManager.instance.listenFinishLiveStream(data => {
      const currentLiveStatus = get(data, 'liveStatus', '');
      this.setState({currentLiveStatus});
    });
    SocketManager.instance.listenSendHeart(() => {
      this.setState(prevState => ({countHeart: prevState.countHeart + 1}));
    });
    SocketManager.instance.listenSendMessage(data => {
      const messages = get(data, 'messages', []);
      this.setState({messages});
    });
  }

  componentWillUnmount() {
    console.log('componenetWillUNMOUNT');

    if (this.timeoutInstance) clearTimeout(this.timeoutInstance);

    if (this.nodeCameraViewRef) this.nodeCameraViewRef.stop();
    SocketManager.instance.emitLeaveRoom({
      userName: this.userName,
      roomName: this.roomName,
    });
  }

  onPressHeart = () => {
    SocketManager.instance.emitSendHeart({
      roomName: this.roomName,
    });
  };

  onPressSend = message => {
    SocketManager.instance.emitSendMessage({
      roomName: this.roomName,
      userName: this.userName,
      message,
    });
    this.setState({isVisibleMessages: true});
  };

  getToken = async () => {
    const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
    if (token) {
      return token;
    }
    return;
  };

  saveFdaDeviceData = async (payloadData, serviceUrl) => {
    console.log('saveFdaDeviceData(): ', payloadData);

    const reqBody = payloadData;
    console.log(reqBody);
    // const token = await this.getToken();
    this.setState({isFetchingData: true});

    try {
      await axios
        .post(serviceUrl, reqBody)
        .then(res => {
          console.log('responseOnSave', res);
          // alert("saveFdaDeviceData: sucess: ", JSON.stringify(res))
          if (res?.data != null) {
            Snackbar.show({
              text: 'Data has been saved successfully',
              duration: Snackbar.LENGTH_LONG,
            });
          }
          this.setState({isFetchingData: false});
        })
        .catch(err => {
          this.setState({isFetchingData: false});
          // alert("saveFdaDeviceData: error: ", JSON.stringify(err))
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });
    } catch (err) {
      this.setState({isFetchingData: false});
      alert('saveFdaDeviceData: inside catch: ', JSON.stringify(err));
      Snackbar.show({
        text: 'Network issue try again later ',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  onEndEditing = () => this.setState({isVisibleMessages: true});

  onFocusChatGroup = () => {
    this.setState({isVisibleMessages: false});
  };

  onPressClose = () => {
    const {navigation} = this.props;
    navigation.goBack();
  };

  onPressLiveStreamButton = () => {
    console.log('onPressLiveStreamButton()');
    console.log('STREAMER LIVE STREAM BUTTON');
    const {navigation} = this.props;
    const userName = navigation.getParam('userName', null);

    const {currentLiveStatus} = this.state;
    if (Number(currentLiveStatus) === Number(LIVE_STATUS.PREPARE)) {
      /**
       * Waiting live stream
       */

      SocketManager.instance.emitBeginLiveStream({
        userName,
        roomName: userName,
      });
      SocketManager.instance.emitJoinRoom({userName, roomName: userName});

      if (this.nodeCameraViewRef) this.nodeCameraViewRef.start();
      this.setState({currentLiveStatus: 1, showButton: false});
      setTimeout(async () => {
        this.setState({serverStatus: true});
        //old ios Veytels api endpoint -> https://rppg-xbozlkb3oq-uc.a.run.app
        //new ios Veytels api endpoint -> https://rppg-migration-xbozlkb3oq-uc.a.run.app
        try {
          var unixTime = Math.round(new Date().getTime() / 1000);
          const uri = `https://rppg-migration-xbozlkb3oq-uc.a.run.app?user_id=${
            this.userName
          }&mode=2&unixTime=${unixTime}`;
          await axios
            .get(uri)
            .then(res => {
              debugger;
              console.log('response from server');
              clearInterval(this.timerState);
              if (res?.data?.HR != 1) {
                this.setState({
                  valueGot: true,
                  bpm: Math.round(res?.data?.HR),
                  progress: 1,
                  sat: res?.data?.O2,
                  hrv: res?.data?.HR,
                  stress: res?.data?.SL,
                  respRate: res?.data?.RR,
                  systolic: res?.data?.Systolic,
                  diastolic: res?.data?.diastolic,
                  showButton: false,
                });
              } else {
                this.setState({
                  showButton: true,
                  currentLiveStatus: 0,
                  progress: 0,
                });
              }
            })
            .catch(err => {
              setTimeout(() => {
                Snackbar.show({
                  text: err?.description,
                  duration: Snackbar.LENGTH_SHORT,
                });
              }, 100);
            });
        } catch (err) {
          Snackbar.show({
            text: 'Network issue try again later ',
            duration: Snackbar.LENGTH_SHORT,
          });
        }
      }, 4000);
    } else if (Number(currentLiveStatus) === Number(LIVE_STATUS.ON_LIVE)) {
    }
  };
  requestCameraPermission = async () => {
    if (Platform.OS != 'android') return null;

    try {
      const granted = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ],
        {
          title: 'vEYEtals need Camera And Microphone Permission',
          message: 'vEYEtals needs access to your camera and microphone.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (
        granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        if (this.nodeCameraViewRef) this.nodeCameraViewRef.startPreview();
      } else {
        Logger.log('Camera permission denied');
      }
    } catch (err) {
      // Logger.log('ERROR getting permissions!', JSON.stringify(err));
      Logger.warn(err);
    }
  };

  renderChatGroup = () => {
    return (
      <ChatInputGroup
        onPressHeart={this.onPressHeart}
        onPressSend={this.onPressSend}
        onFocus={this.onFocusChatGroup}
        onEndEditing={this.onEndEditing}
      />
    );
  };

  renderListMessages = () => {
    const {messages, isVisibleMessages} = this.state;
    if (!isVisibleMessages) return null;
    return <MessagesList messages={messages} />;
  };

  setCameraRef = ref => {
    this.nodeCameraViewRef = ref;
  };
  errorHandler = () => {
    this.state.bpm = 'NA';
    Alert.alert('Face not detected');
    this.onPressClose();
  };

  async onSavePress() {
    const {navigation} = this.props;
    const origin = navigation.getParam('origin');
    const onSaveCallback = navigation.getParam('onSaveCallback');
    if (origin && origin == 'Screening') {
      onSaveCallback({
        heartRate: parseInt(this.state.bpm),
        oxygenLevel: parseInt(this.state.sat),
        hrv: parseInt(this.state.hrv),
      });
      navigation.goBack();
      // navigation.popToTop();
      return;
    }

    this.setState({savingData: true});

    const apiPayload = {
      deviceTag: 'Veyetals',
      heartRate: this.state.bpm,
      hrv: this.state.hrv,
      oxygenLevel: this.state.sat,
      respiratoryRate: this.state.respRate,
      stressLevel: this.state.stress,
      systolic: this.state.systolic,
      diastolic: this.state.diastolic,
    };

    let id = await StorageUtils.getValue(AppConstants.SP.USER_ID);
    const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);

    this.saveFdaDeviceData(apiPayload, api.addBMIScale).then(r => {
      this.setState({
        savingData: false,
        countHeart: 0,
        progress: 0,
        bpm: '',
        hrv: '',
        respRate: '',
        sat: '',
        stress: '',
        systolic: '',
        diastolic: '',
        data: '',
      });
      navigation.goBack();
    });
  }

  InfoBox = ({showButton}) => {
    console.log('props: ', showButton);
    const filterValue = val =>
      !val || val == 'NA' || isNaN(parseInt(val)) ? false : parseInt(val);

    const {bpm, hrv, sat, respRate, stress, systolic, diastolic} = this.state;

    const info = {
      bpm: filterValue(bpm),
      hrv: filterValue(hrv),
      sat: filterValue(sat),
      respRate: filterValue(respRate),
      stress: stress === 0 ? 0 : filterValue(stress),
      systolic: filterValue(systolic),
      diastolic: filterValue(diastolic),
    };

    const vitalCountCard = (label, value, icon, color) => {
      return (
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.8)',
            borderRadius: 8,
            marginEnd: 8,
            maxWidth: '34%',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}>
          <View style={{marginVertical: 4}}>
            <Image
              source={icon}
              style={{height: 30, width: 30}}
              resizeMode={'cover'}
            />
          </View>
          <View
            style={{
              height: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 'bold',
                textAlign: 'center',
                color: color,
              }}>
              {label}
            </Text>
          </View>
          <Text
            style={{fontSize: 14, fontWeight: 'normal', textAlign: 'center'}}>
            {value}
          </Text>
        </View>
      );
    };

    const stressColor = stress => {
      let green = '#00DD52';
      let orange = '#E2B62C';
      let red = '#FF1500';

      if (stress === 3 || stress === 4) {
        return red;
      } else if (stress === 1 || stress === 2) {
        return orange;
      } else {
        return green;
      }
    };

    const getStressLabel = stress => {
      switch (stress) {
        case -1:
          return 'Relaxed';
        case 0:
          return 'Normal';
        case 1:
          return 'Low Stress';
        case 2:
          return 'Medium Stress';
        case 3:
          return 'High Stress';
        case 4:
          return 'Very High Stress';
        default:
          return 'Relaxed';
      }
    };

    const getStressIcon = stress => {
      if (stress === 3 || stress === 4) {
        return icons.stress_high;
      } else if (stress === 1 || stress === 2) {
        return icons.stress_medium;
      } else {
        return icons.stress_low;
      }
    };

    ButtonToShow = () => {
      {
        this.state.showButton == true ? (
          <TouchableOpacity
            onPress={() => {
              this.setState({
                progress: 0,
              });

              // this.componentWillUnmount();
              // this.UNSAFE_componentWillMount();
              // this.componentDidMount();
            }}
            style={{
              width: '100%',
              height: 48,
              backgroundColor: 'white',
              marginHorizontal: 8,
              marginTop: 8,
              justifyContent: 'center',
              alignItems: 'center',
              cornerRadius: 8,
            }}>
            <Text style={{fontSize: 14, fontWeight: 'bold'}}>{'Retry'}</Text>
          </TouchableOpacity>
        ) : (
          <View>
            {console.log('i am seting styaleing ')}
            <TouchableOpacity
              onPress={() => {
                // this.onPressClose();
                this.onSavePress();
              }}
              style={{
                width: '100%',
                height: 48,
                backgroundColor: 'white',
                marginHorizontal: 8,
                marginTop: 8,
                justifyContent: 'center',
                alignItems: 'center',
                cornerRadius: 8,
              }}>
              <Text style={{fontSize: 14, fontWeight: 'bold'}}>{'Save'}</Text>
            </TouchableOpacity>
          </View>
        );
      }
    };

    return (
      <View style={styles.infoBox}>
        <View style={{alignSelf: 'center', marginBottom: 8}}>
          <ProgressBar
            progress={this.state.progress}
            animated={true}
            borderWidth={0}
            color="#00d024"
            borderColor="white"
            borderRadius={10}
            height={14}
            width={styles.infoBox.width - 32}
          />
          <Text style={styles.progressText}>
            {parseInt(this.state.progress * 100)}%
          </Text>
        </View>

        <View>
          {showButton == true && (
            <Text style={styles.note}>
              {
                'Your face was not detected.\nPosition your face in the circle and start measurement again'
              }
            </Text>
          )}
          <Row style={{paddingStart: 8}}>
            {vitalCountCard(
              'Heart Rate',
              info.bpm ? `${info.bpm} bpm` : '- -',
              icons.heart,
              '#FF4379',
            )}
            {vitalCountCard(
              'Heart Rate Variability',
              info.hrv ? `${info.hrv} ms` : '- -',
              icons.heart_with_rate,
              '#FF0006',
            )}
            {vitalCountCard(
              'O2 Level',
              info.sat ? `${info.sat} %` : '- -',
              icons.oxygen_level,
              '#0B247D',
            )}
          </Row>
          <Row style={{paddingStart: 8, marginTop: 8}}>
            {vitalCountCard(
              'Respiratory Level',
              info.respRate ? `${info.respRate} bpm` : '- -',
              icons.respiratory_level,
              '#C67D54',
            )}
            {vitalCountCard(
              'Blood Pressure',
              info.systolic || info.diastolic
                ? `${info.systolic}` + '/' + `${info.diastolic} mmHg`
                : '- / -',
              icons.blood_pressure,
              '#D63542',
            )}
            {vitalCountCard(
              'Stress',
              info.stress || info.stress === 0
                ? `${getStressLabel(info.stress)}`
                : '- -',
              getStressIcon(info.stress),
              stressColor(info.stress),
            )}
          </Row>
          {/* <Row> */}
          {showButton == true && this.state.progress == 0 && (
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  progress: 0,
                });
                this.runTimer();

                // this.componentWillUnmount();
                // this.UNSAFE_componentWillMount();
                // this.componentDidMount();
              }}
              style={{
                width: '100%',
                height: 48,
                backgroundColor: 'white',
                marginHorizontal: 8,
                marginTop: 8,
                justifyContent: 'center',
                alignItems: 'center',
                cornerRadius: 8,
              }}>
              <Text style={{fontSize: 14, fontWeight: 'bold'}}>{'Retry'}</Text>
            </TouchableOpacity>
          )}
          {showButton == false && this.state.progress == 1 && (
            <View>
              {console.log('i am seting styaleing ')}
              <TouchableOpacity
                onPress={() => {
                  // this.onPressClose();
                  this.onSavePress();
                }}
                style={{
                  width: '100%',
                  height: 48,
                  backgroundColor: 'white',
                  marginHorizontal: 8,
                  marginTop: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  cornerRadius: 8,
                }}>
                <Text style={{fontSize: 14, fontWeight: 'bold'}}>{'Save'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  render() {
    const {navigation, route} = this.props;
    //const { userName } = this.state
    const {countHeart} = this.state;
    const userName = navigation.getParam('userName', null);
    const saveEnabled = this.state.valueGot == true && this.state.bpm != 1;
    const outputUrl = `${RTMP_SERVER}/live/${userName}`;

    return (
      <SafeAreaView style={styles.container}>
        <View>
          <NodeCameraView
            style={styles.cameraView_camera}
            ref={this.setCameraRef}
            outputUrl={outputUrl}
            camera={{cameraId: 1, cameraFrontMirror: true}}
            audio={audioConfig}
            video={videoConfig}
            smoothSkinLevel={3}
            autopreview={Platform.OS !== 'android'}
          />

          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: Dimensions.get('window').height,
            }}>
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <View style={styles.cameraView}>
                <View style={styles.cameraViewBox} />
              </View>
            </View>
            <View style={{flex: 1}}>
              <this.InfoBox showButton={this.state.showButton} />
              <View style={styles.footer}>
                {this.renderChatGroup()}
                {this.renderListMessages()}
              </View>
              <FloatingHearts count={countHeart} />
            </View>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                style={styles.backArrowContainer}
                onPress={() => {
                  this.props.navigation.goBack();
                }}>
                <Image source={icons.arrow_blue} style={{tintColor: 'white'}} />
              </TouchableOpacity>
            ) : (
              <></>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

Streamer.propTypes = {
  navigation: PropTypes.shape({
    goBack: PropTypes.func,
  }),
  route: PropTypes.shape({}),
};

Streamer.defaultProps = {
  navigation: {
    goBack: null,
  },
  route: null,
};
