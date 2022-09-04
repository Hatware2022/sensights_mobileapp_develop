import {AppConstants, StorageUtils, showMessage} from '../../utils';
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import {NavigationActions, StackActions} from 'react-navigation';
import React, {Component} from 'react';

// import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell, } from 'react-native-confirmation-code-field';

import RNLocation from 'react-native-location';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';
import {api} from '../../api';
import {images} from '../../assets';
import {theme} from '../../theme';
import updater from '../../utils/updater';
import VerificationCodeForm from './VerificationCodeForm';
import {EventRegister} from 'react-native-event-listeners';
import axios from 'axios';
import colors from '../../theme/colors';

export class CodeVerificationRegistration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      codeValue: '',
      CodeSumbitToMail: this.props.navigation.state.params.Email,
      UserType: this.props.navigation.state.params.UserType,
      AppType: this.props.navigation.state.params.AppType,
    };
    this.locationPosted = false;
  }
  containerProps = {style: styles.inputWrapStyle};

  componentWillUnmount() {
    try {
      this.locationSubscription();
    } catch (error) {}
  }

  onFinishCheckingCode = code => {
    if (/^[0-9]*$/.test(code)) {
      this.setState({verifyCode: code});
    } else {
      showMessage('Please enter code in numbers only');
    }
  };

  showError = error => {
    setTimeout(
      function() {
        Snackbar.show({
          text: error,
          duration: Snackbar.LENGTH_LONG,
        });
      }.bind(this),
      100,
    );
  };

  cellProps = ({/*index, isFocused,*/ hasValue}) => {
    if (hasValue) {
      return {
        style: [styles.input, styles.inputNotEmpty],
      };
    }
    return {
      style: styles.input,
    };
  };

  submitCode = async () => {
    let Role = '';
    if (this.state.UserType == 1) {
      Role = 'senior';
    } else {
      Role = 'caretaker';
    }
    if (!this.state.verifyCode || this.state.verifyCode.length < 6) {
      this.showError('Fill the code');
      return;
    }
    const {Email, Password, AppType} = this.props.navigation.state.params;
    var token = await StorageUtils.getValue(AppConstants.SP.DEVICE_TOKEN);

    const body = new FormData();
    body.append('LoginName', Email);
    body.append('Password', Password);
    body.append('DeviceToken', token);
    body.append('Role', Role);
    body.append('OffSetHoursDevice', new Date().getTimezoneOffset() / -60);
    try {
      this.setState({loading: true});
      var confirmationResponse = await axios
        .post(
          `${api.confirmPasswordForRegistration}?token=${
            this.state.verifyCode
          }`,
          body,
        )
        .then(res => {
          if (res?.data != null) {
            this.postCurrentLocation(res?.data?.accessToken, res?.data?.role);
            this.setState({loading: false});
            return res?.data;
          }
          this.setState({loading: false});
        })
        .catch(err => {
          this.setState({loading: false});
          this.showError(err?.description);
          return false;
        });
    } catch (err) {
      this.setState({loading: false});
      showMessage('Network issue try again');
      return false;
    }

    if (!confirmationResponse) return;

    const profileData = await updater.fetchProfileLogin({
      ...confirmationResponse,
      applicationType: AppType,
      showCart: false,
      isLoggedIn: true,
      email: Email,
      password: Password,
    });
    EventRegister.emit('onAppLogin', {...profileData});
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        NavigationActions.navigate({
          routeName: 'EditProfileScreen',
          params: {noBack: true, ...profileData},
        }),
      ],
    });
    this.props.navigation.dispatch(resetAction);
  };

  postCurrentLocation = async (token, role) => {
    if (role === 'senior') {
      RNLocation.configure({distanceFilter: 50.0});
      RNLocation.requestPermission({
        ios: 'whenInUse',
        android: {detail: 'coarse'},
      }).then(granted => {
        if (granted) {
          this.locationSubscription = RNLocation.subscribeToLocationUpdates(
            async locations => {
              if (!this.locationPosted) {
                try {
                  await axios
                    .post(api.seniorLocations, {
                      latitude: locations[0]?.latitude,
                      longitude: locations[0]?.longitude,
                      isWatchPaired: true,
                    })
                    .then(res => {
                      this.setState({loading: false});
                    })
                    .catch(err => {
                      this.setState({loading: false});
                    });
                } catch (err) {
                  this.setState({loading: false});
                }
                this.locationPosted = true;
              }
            },
          );
        }
      });
    } else {
      this.setState({loading: false});
    }
  };

  onResendCode = async () => {
    const {
      Email,
      Password,
      UserType,
      AppType,
      CompanyId,
    } = this.props.navigation.state.params;

    const body = new FormData();
    body.append('FirstName', 'New User');
    body.append('LastName', 'New User');
    body.append('Email', Email);
    body.append('Password', Password);
    body.append('ConfirmPassword', Password);
    body.append('UserType', UserType);
    body.append('ApplicationType', AppType);
    if (UserType == 2) body.append('CompanyId', CompanyId);

    try {
      this.setState({loading: true});
      await axios
        .post(api.signUp, body)
        .then(res => {
          if (res?.data != null) {
            this.setState({loading: false});
            setTimeout(() => {
              Snackbar.show({
                text: res?.data?.message,
                duration: Snackbar.LENGTH_LONG,
              });
            }, 100);
          }

          this.setState({loading: false});
        })
        .catch(err => {
          this.setState({loading: false});
          this.showError(err);
        });
    } catch (err) {
      this.setState({loading: false});
      showMessage('Network issue try again');
    }
  };

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <StatusBar translucent backgroundColor="transparent" />
        <ImageBackground
          style={theme.palette.backgroundOnBoarding}
          source={images.login_bg}
        />

        <Spinner visible={this.state.loading} />
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>
                Enter 6-digit code to confirm account
              </Text>

              <Text style={styles.inputSubLabel}>
                The verification code has been sent to {'\n'}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  paddingBottom: 10,
                  fontWeight: '600',
                  color: colors.white,
                }}>
                {this.state.CodeSumbitToMail}
              </Text>
              <Text style={styles.inputSubLabel}>Please enter that code</Text>
              <VerificationCodeForm onChange={this.onFinishCheckingCode} />

              <TouchableOpacity activeOpacity={0.8} onPress={this.onResendCode}>
                <Text
                  style={{
                    ...theme.palette.buttonText,
                    color: theme.colors.white,
                    marginTop: 16,
                  }}>
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[theme.palette.buttonWhiteBg, styles.submitButton]}
              onPress={!this.state.loading ? this.submitCode : undefined}>
              <Text style={theme.palette.buttonTextPrimary}>Submit Code</Text>
            </TouchableOpacity>
            <Text style={styles.subLabel}>
              Please check your spam or junk mail folder in case you have not
              received the email with the verification code within a few minutes
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 5,
    paddingLeft: 5,
  },
  submitButton: {
    marginTop: 20,
    width: '80%',
  },
  inputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    paddingTop: 90,
    paddingBottom: 10,
    color: '#FFFF',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputSubLabel: {
    color: '#FFFF',
    textAlign: 'center',
  },
  inputWrapStyle: {
    height: 50,
    marginTop: 30,
  },
  input: {
    height: 50,
    width: 40,
    borderRadius: 3,
    color: '#FFFF',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    ...Platform.select({
      web: {
        lineHeight: 46,
      },
    }),
  },
  inputNotEmpty: {
    backgroundColor: 'rgba(0,0,0,0)',
  },
  nextButton: {
    marginTop: 100,
    width: 70,
    height: 70,
    borderRadius: 80,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    // IOS
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    // Android
    elevation: 5,
  },
  nextButtonArrow: {
    transform: [{translateX: -3}, {rotate: '45deg'}],
    borderColor: '#ff595f',
    width: 20,
    height: 20,
    borderWidth: 4,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  subLabel: {
    color: '#FFFF',
    textAlign: 'center',
    marginTop: 15,
  },
});
