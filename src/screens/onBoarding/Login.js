import {StorageUtils, showMessage} from '../../utils';
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Keyboard,
  TouchableOpacity,
  View,
  Modal,
  Button,
} from 'react-native';
import {NavigationActions, StackActions} from 'react-navigation';
import React, {Component} from 'react';
import {icons} from '../../assets';
import {VERSION} from '../../../version';
import {EventRegister} from 'react-native-event-listeners';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';
import {api} from '../../api';
import Pushy from 'pushy-react-native';
// import firebase from "react-native-firebase";
import {theme} from '../../theme';
// import { SocialLoginButtons } from '../../components'
import ProfileUpdater from '../../utils/updater';
import axios from 'axios';
export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      spinner: false,
      showPassword: false,
      modalVisible: false,
      policyId: null,
      policyText: '',
      policyTitle: '',
      userId: '',
      token: '',
      userData: '',
      emailSend: this.props?.navigation?.state?.params?.emailSend ? true : false,
      emailVerified: this.props.navigation.state.params?.emailVerified ? true : false,
      showModal: false
    };
  }

  componentDidMount(){
    console.log("componentDidMount : ",this.props.navigation.state.params?.emailSend)
    if(this.props.navigation.state.params?.emailSend){
      this.setState({
        email:'',
        password:'',
        emailSend: true
      },()=>{
        this.setState({emailSend: true})
        console.log('nextProps : ',this.state.emailSend)
      })
    }
  }

  onChangeText = value => {
    this.setState({value});
  };

  validate = text => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      return false;
    }
    return true;
  };

  privacyPolicy = async userData => {
    let uri = String(api.privacyPolicy).replace('{userId}', userData.userId);

    await axios
      .get(uri)
      .then(async res => {
        if (res?.data && res?.data?.length == 0) {
          await ProfileUpdater.refetchLocalProfile({
            ...userData,
            isLoggedIn: true,
            showCart: false,
          });
          this.setState({spinner: false});
          const resetAction = StackActions.reset({
            index: 0,
            actions: [NavigationActions.navigate({routeName: 'HomeScreen'})],
          });
          this.props.navigation.dispatch(resetAction);
        } else {
          this.setState({
            spinner: false,
            modalVisible: true,
            policyId: res?.data[0]?.policyId,
            policyText: res?.data[0]?.policyText,
            policyTitle: res?.data[0]?.title,
            userId: userData?.userId,
            token: userData?.accessToken,
            userData: userData,
          });
        }
      })
      .catch(err => {
        this.setState({spinner: false});
        Snackbar.show({
          text: err?.response?.data?.errors[0]?.description,
          duration: Snackbar.LENGTH_SHORT,
        });
      });
  };

  accecptPrivacyPolicy = () => {
    this.setState({modalVisible: false, spinner: true});

    var body = {
      userId: this.state.userId,
      policyId: this.state.policyId,
      reply: 'yes',
    };
    // var formData = new FormData();
    // formData.append("UserId",this.state.userId)
    // formData.append("PolicyId",this.state.policyId)
    // formData.append("Reply","yes")
    fetch(api.accecptPrivacyPolicy, {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',

        Authorization: 'Bearer ' + this.state.token,
      },
      body: JSON.stringify(body),
    })
      .then(response => {
        return response.json();
      })
      .catch(error => {
        this.setState({spinner: false});
      })
      .then(data => {
        if (data) {
          ProfileUpdater.refetchLocalProfile({
            ...this.state.userData,
            isLoggedIn: true,
            showCart: false,
          }).then(r => {
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({routeName: 'HomeScreen'})],
            });
            this.props.navigation.dispatch(resetAction);
          });
        }
      });
  };

  login = async () => {
    this.setState({spinner: true});
    var message = '';
    if (this.state.email.length == 0 || !this.validate(this.state.email))
      message = theme.strings.enter_email;
    else if (this.state.password.length == 0)
      message = theme.strings.enter_password;

    if (message.length > 0) {
      this.setState({spinner: false});
      Snackbar.show({text: message, duration: Snackbar.LENGTH_SHORT});
      return;
    }
    if (!(await StorageUtils.getValue('pushy_token'))) {
      await Pushy.register()
        .then(async pushy_token => {
          // console.log('Registerd token...............', pushy_token);
          await StorageUtils.storeInStorage('pushy_token', `${pushy_token}`);
        })
        .catch(err => {
          this.setState({spinner: false});
        });
    }

    try {
      const date = new Date();
      const offset = date.getTimezoneOffset() / 60;
      const timeOffset = offset < 0 ? Math.abs(offset) : -offset;
      var Device_Token = await StorageUtils.getValue('pushy_token');
      await axios
        .post(api.login, {
          loginName: this.state.email,
          password: this.state.password,
          deviceToken: Device_Token,
          offSetHoursDevice: timeOffset.toString(),
        })
        .then(res => {
          if (res?.data != null && res?.data?.accessToken != undefined) {
            if (
              res?.data?.role !== 'caretaker' &&
              res?.data?.role !== 'senior'
            ) {
              setTimeout(() => {
                showMessage('User role is not authorized to login', 'long');
              }, 200);
              this.setState({spinner: false});
              return;
            }
          }
          EventRegister.emit('onAppLogin', {...res.data});
          this.privacyPolicy(res.data);
        })
        .catch(err => {
          this.setState({spinner: false});
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });
    } catch (error) {
      this.setState({spinner: false});
      Snackbar.show({
        text: 'Netwrork error try again',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };
  //Subcription Connectycube call notification
  // subcribeToPushNotification = async () => {
  //   // const DeviceInfo = require('react-native-device-info').default;
  //   var deviceToken = await StorageUtils.getValue('pushy_token');
  //   const params = {
  //     notification_channel: Platform.OS === 'ios' ? 'apns' : 'gcm',
  //     device: {
  //       platform: Platform.OS,
  //       udid: DeviceInfo.getUniqueId(),
  //     },
  //     push_token: {
  //       environment: 'production',
  //       client_identification_sequence: deviceToken,
  //       bundle_identifier: 'com.sensights',
  //     },
  //   };
  //   ConnectyCube.pushnotifications.subscriptions
  //     .create(params)
  //     .then(result => {
  //       console.log(result);
  //       debugger;
  //     })
  //     .catch(error => {
  //       console.log(error);
  //       debugger;
  //     });
  // };
  showError = () => {
    this.setState({spinner: false});

    Snackbar.show({
      text: theme.strings.call_fail_error,
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  modalView = () => {
    return (
      <Modal visible={this.state.modalVisible} transparent={true}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#d3d3d3C2',
          }}>
          <View
            style={{
              width: '90%',
              height: '90%',
              backgroundColor: 'white',
              padding: 22,
            }}>
            <Text style={{fontWeight: 'bold', fontSize: 18}}>
              {this.state.policyTitle}
            </Text>

            <View style={{height: '87%', marginTop: 10}}>
              <ScrollView>
                <Text
                  style={{fontSize: 18, lineHeight: 25, letterSpacing: 0.35}}>
                  {this.state.policyText}
                </Text>
              </ScrollView>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                height: '8%',
              }}>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={() => this.accecptPrivacyPolicy()}>
                <Text style={{color: '#fff', fontSize: 15}}>Agree</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {this.modalView()}
        <StatusBar
          barStyle="light-content"
          translucent
          backgroundColor={theme.colors.colorPrimary}
        />
        <Spinner
          visible={this.state.spinner}
          textStyle={styles.spinnerTextStyle}
        />

        <ScrollView
          contentContainerStyle={{flex: 1}}
          keyboardShouldPersistTaps="handled">
          <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
              <View style={{marginTop: Platform.OS === 'ios' ? 15 : 35}} />
              {/* <TouchableOpacity onPress={() => { this.props.navigation.goBack(null); }} activeOpacity={0.8}>
                  <Text style={styles.cancel}>{theme.strings.cancel}</Text>
                </TouchableOpacity> */}
              <View style={{flex: 1, justifyContent: 'center'}}>
                <Text style={styles.loginToYourAccount}>
                  {theme.strings.login_to_your_account}
                </Text>
                <View style={{height: 15}} />
                <TextInput
                  style={theme.palette.textInputTransparentBGLogin}
                  placeholder={theme.strings.email}
                  placeholderTextColor={theme.colors.white}
                  keyboardType={'email-address'}
                  onChangeText={text => {
                    this.setState({email: text});
                  }}
                  autoCapitalize="none"
                />
                <View style={styles.passwordContainerLogin}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={theme.strings.password}
                    placeholderTextColor={theme.colors.white}
                    secureTextEntry={!this.state.showPassword}
                    onChangeText={text => {
                      this.setState({password: text});
                    }}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({showPassword: !this.state.showPassword})
                    }
                    style={{
                      paddingLeft: 2,
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Image source={icons.show_password_login} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    this.props.navigation.navigate('ForgotPassword');
                  }}>
                  <Text style={styles.forgotYourPassword}>
                    {theme.strings.forgot_your_password}
                  </Text>
                </TouchableOpacity>
                <View style={{height: 5}} />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.buttonWhiteBg}
                  onPress={() => {
                    Keyboard.dismiss();
                    this.login();
                  }}>
                  <Text style={theme.palette.buttonTextPrimary}>
                    {theme.strings.login}
                  </Text>
                </TouchableOpacity>
                <View style={styles.horizontalView}>
                  <Text style={styles.notMember}>
                    {theme.strings.not_yet_a_member}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate('SignupScreen')
                    }>
                    <Text style={styles.signUp}>{theme.strings.signup}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.in_app_disclosure}>
                  {theme.strings.in_app_disclosure}
                </Text>
                <Text style={styles.in_app_disclosure}>v {VERSION}</Text>
              </View>
            </View>
            <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.emailSend}
          onRequestClose={() => this.setState({ showModal:false})}>
              <View style={styles.card}>
                  <Image source={require('../../assets/images/tick.png')} style={styles.modalImg}/>
                  <Text style={styles.modalHeading}>{this.state.emailVerified ? 'Verified' : 'Email Sent'}</Text>
                  <Text style={styles.modalTxt}>{this.state.emailVerified ? 'Your Email has been confirmed. Please go back to login page.' : 'Please check your email for verification link'}</Text>
                <View style={styles.modalBtnBlack}>
                 <Button title='OK' onPress={()=>this.state.emailVerified ? 
                  (this.props.navigation.navigate('Login') && this.setState({emailVerified:false}))
                  || this.setState({emailSend:false}) : this.setState({emailSend:false})} />
                 </View>
              </View>
        </Modal>
          </SafeAreaView>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.colorPrimary,
    paddingHorizontal: Platform.OS == 'ios' ? 20 : 10,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
  cancel: {
    color: theme.colors.white,
    fontSize: 13,
    textAlign: 'right',
    fontFamily: theme.fonts.SFProSemibold,
    margin: 10,
  },
  loginToYourAccount: {
    color: theme.colors.white,
    fontSize: 38,
    textAlign: 'center',
    fontFamily: theme.fonts.SFProBold,
  },
  in_app_disclosure: {
    color: theme.colors.white,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: theme.fonts.SFProRegular,
    margin: 25,
  },
  forgotYourPassword: {
    color: theme.colors.white,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: theme.fonts.SFProRegular,
    margin: 12,
  },
  loginWithText: {
    color: theme.colors.white,
    fontSize: 15,
    textAlign: 'center',
    fontFamily: theme.fonts.SFProRegular,
    marginBottom: 20,
  },
  horizontalView: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  notMember: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: theme.fonts.SFProRegular,
  },
  signUp: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: theme.fonts.SFProSemibold,
    marginLeft: 5,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    marginHorizontal: Platform.OS == 'ios' ? 20 : 10,
  },
  horizontalLine: {
    width: 2,
    backgroundColor: 'rgba(37, 190, 237, 0.14)',
  },
  passwordContainerLogin: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 45,
    color: theme.colors.white,
    alignItems: 'center',
    fontSize: 15,
    fontFamily: theme.fonts.SFProRegular,
    backgroundColor: 'transparent',
    marginTop: 7,
    borderRadius: 8,
    paddingLeft: 10,
    paddingRight: 10,
    borderColor: theme.colors.white,
    borderWidth: 1,
  },
  passwordInput: {
    height: '100%',
    flex: 1,
    color: theme.colors.white,
    paddingLeft: 4,
  },
  buttonWhiteBg: {
    height: 45,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: {width: 1, height: 5},
  },
  modalBtn: {
    width: '40%',
    height: 45,
    backgroundColor: theme.colors.colorPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '90%',
    minHeight: 100,
    backgroundColor: '#fff',
    elevation: 5,
    position: 'absolute',
    alignSelf: 'center',
    marginTop: '45%',
    borderRadius: 10,
  },
  modalImg: {
    width: 70, 
    height: 70, 
    alignSelf: 'center'
  },
  modalHeading: {
    alignSelf: 'center',
    fontWeight: 'bold',
    fontSize: 22,
    marginTop: 10,
  },
  modalTxt: {
    alignSelf: 'center',
    fontWeight: '500',
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  modalBtnBlack: {
    width: 70, 
    alignSelf: 'center', 
    marginTop: 30, 
    marginBottom: 10
  },
});
