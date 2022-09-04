import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {Component} from 'react';

import Snackbar from 'react-native-snackbar';
import {api} from '../../api';
import {theme} from '../../theme';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import {showMessage} from '../../utils';
export class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinner: false,
      email: '',
    };
  }
  containerProps = {style: styles.inputWrapStyle};

  validate = text => {
    console.log(text);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      return false;
    }
    return true;
  };

  onFinishCheckingCode = code => {
    console.log(code);
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

  handleChange = (name, value) => {
    this.setState({
      [name]: value,
    });
  };

  sendMail = async () => {
    let message = '';
    if (this.state.email.length == 0 || !this.validate(this.state.email)) {
      message = theme.strings.enter_email;
      if (message.length > 0) {
        Snackbar.show({text: message, duration: Snackbar.LENGTH_SHORT});
        return;
      }
    }
    var body = {email: this.state.email};

    try {
      this.setState({spinner: true});
      await axios
        .post(api.forgotPassword, body)
        .then(res => {
          if (res?.data != null) {
            this.setState({spinner: false});
            setTimeout(() => {
              Snackbar.show({
                text: res?.data.message,
                duration: Snackbar.LENGTH_SHORT,
              });
            }, 100);
            this.props.navigation.navigate('ResetPassword', {
              email: this.state.email,
            });
          }
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
      <View style={styles.container}>
        {/* <View style={{ marginTop: Platform.OS === "ios" ? 15 : 35 }} /> */}
        <Spinner visible={this.state.spinner} />
        <Text style={styles.title}>{theme.strings.forgot_password}</Text>
        <TextInput
          style={[theme.palette.textInputTransparentBg, styles.inputField]}
          placeholder={theme.strings.email}
          placeholderTextColor={theme.colors.white}
          keyboardType={'email-address'}
          onChangeText={text => this.handleChange('email', text)}
        />

        <TouchableOpacity
          onPress={this.sendMail}
          activeOpacity={0.8}
          style={[theme.palette.buttonWhiteBg, styles.submitButton]}>
          <Text style={theme.palette.buttonTextPrimary}>
            {theme.strings.send_mail}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => this.props.navigation.goBack()}
          activeOpacity={0.8}>
          <Text style={styles.cancel}>{theme.strings.cancel}</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: theme.colors.colorPrimary,
  },
  cancel: {
    color: theme.colors.white,
    fontSize: 13,
    textAlign: 'right',
    fontFamily: theme.fonts.SFProSemibold,
    margin: 10,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 20,
    width: '80%',
  },
  inputField: {
    width: '80%',
  },
});
