import axios from 'axios';
import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  AsyncStorage
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
// import CodeFiled from "react-native-confirmation-code-field";
import Snackbar from 'react-native-snackbar';
import {api} from '../../api';
import {icons} from '../../assets';
// import { images } from "../../assets";
import {theme} from '../../theme';
import {showMessage} from '../../utils';
import VerificationCodeForm from './VerificationCodeForm';

export class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      confirmPassword: '',
      code: '',
      showPassword: true,
      email:''
    };
  }
  containerProps = {style: styles.inputWrapStyle};

  onFinishCheckingCode = code => {
    console.log(code);
    this.setState({code: code});
  };

  handleChange = (name, value) => {
    this.setState({[name]: value});
  };

  cellProps = ({/*index, isFocused,*/ hasValue}) => {
    if (hasValue) {
      return {style: [styles.input, styles.inputNotEmpty]};
    }
    return {style: styles.input};
  };

  resetPassword = async () => {
    AsyncStorage.getItem('email').then(e => this.setState({email:e}))
    // if (this.state.code === '') {
    //   Snackbar.show({
    //     text: theme.strings.code_not_found,
    //     duration: Snackbar.LENGTH_SHORT,
    //   });
    //   return;
    // }
    if (this.state.password !== this.state.confirmPassword) {
      Snackbar.show({
        text: theme.strings.password_not_match,
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    if (this.state.password.length < 8) {
      Snackbar.show({
        text: theme.strings.minimum_password_length,
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    var body = {
      code: this.props.navigation.state.params?.code,
      confirmPassword: this.state.confirmPassword,
      email: this.props.navigation.state.params?.email,
      password: this.state.password,
    };
    
    try {
      this.setState({spinner: true});
      await axios
        .post(api.resetPassword, body)
        .then(res => {
          if (res?.data != null) {
            this.setState({spinner: false});
            if (res?.data?.isValid) {
              setTimeout(() => {
                Snackbar.show({
                  text: res?.data?.message,
                  duration: Snackbar.LENGTH_SHORT,
                });
              }, 100);
              AsyncStorage.clear()
              this.props.navigation.navigate('Login');
            } else {
              setTimeout(() => {
                Snackbar.show({
                  text: res?.data?.message,
                  duration: Snackbar.LENGTH_SHORT,
                });
              }, 100);
            }
          }
        })
        .catch(err => {
          console.log('err : ',err)
          this.setState({spinner: false});
          this.showError();
        });
    } catch (err) {
      this.setState({spinner: false});
      showMessage('Network issue try again');
    }
  };

  showError = () => {
    Snackbar.show({
      text: theme.strings.call_fail_error,
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <Spinner visible={this.state.spinner} />
        <View style={styles.container}>
          <Text style={styles.title}>{theme.strings.reset_password}</Text>

          <View style={{marginBottom: 20}}>
            {/* <VerificationCodeForm onChange={this.onFinishCheckingCode} /> */}
            {/* <CodeFiled
              rootStyle={{borderColor:"#FF0000"}}
              blurOnSubmit={false}
              variant="clear"
              codeLength={6}
              keyboardType="numeric"
              cellProps={this.cellProps}
              containerProps={this.containerProps}
              onFulfill={this.onFinishCheckingCode}
            /> */}
          </View>
          {/* <Text style={styles.emailConfirmationText}>
            An email confirmation code has been sent to
          </Text> */}
          <Text style={styles.mailtitle}>
            {this.props.navigation.state.params?.email}
          </Text>
          <View style={styles.passwordContainerLogin}>
            <TextInput
              // style={[theme.palette.textInputTransparentBg, styles.inputField]}
              style={styles.passwordInput}
              placeholder={theme.strings.new_password}
              placeholderTextColor={theme.colors.white}
              secureTextEntry={this.state.showPassword}
              autoCapitalize="none"
              onChangeText={text => this.handleChange('password', text)}
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
          <View style={styles.passwordContainerLogin}>
            <TextInput
              style={styles.passwordInput}
              placeholder={theme.strings.confirm_password}
              placeholderTextColor={theme.colors.white}
              secureTextEntry={this.state.showPassword}
              autoCapitalize="none"
              onChangeText={text => this.handleChange('confirmPassword', text)}
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
            onPress={this.resetPassword}
            activeOpacity={0.8}
            style={[theme.palette.button, styles.submitButton]}>
            <Text style={theme.palette.buttonText}>
              {theme.strings.reset_password}
            </Text>
          </TouchableOpacity>
          <Text style={styles.emailConfirmationText}>
            If you haven't received an email message, please check your spam
            folder.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
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
    width: '85%',
  },
  passwordInput: {
    width: '90%',
    height: '100%',
    color: theme.colors.white,
    paddingLeft: 4,
    marginEnd: 10,
  },
  emailConfirmationText: {
    color: theme.colors.white,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: theme.colors.colorPrimary,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 5,
    paddingLeft: 5,
  },
  title: {
    color: '#FFF', // theme.colors.colorPrimary,
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
  },
  mailtitle: {
    color: '#FFF', // theme.colors.colorPrimary,
    fontWeight: 'bold',
    fontSize: 20,
    paddingVertical: 10,
  },
  inputField: {
    width: '80%',
    borderColor: theme.colors.colorPrimary,
  },
  submitButton: {
    marginTop: 20,
    width: '85%',
    borderWidth: 1,
    borderColor: '#FFF',
    marginBottom: 20,
  },
  inputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    paddingTop: 100,
    paddingBottom: 10,
    color: '#000',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputSubLabel: {
    color: '#000',
    textAlign: 'center',
  },
  inputWrapStyle: {
    height: 50,
    marginTop: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.colorPrimary,
    height: 50,
    width: 40,
    borderRadius: 3,
    color: '#000',
    fontWeight: 'bold',
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
});
