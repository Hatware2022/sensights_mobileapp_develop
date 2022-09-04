import {AppConstants, StorageUtils} from '../../../utils';
import React, {Component} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  View,
} from 'react-native';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';
import {api} from '../../../api';
// import { theme } from "../../../theme";
import Header from '../../../components/Header';
import {InputField} from '../../../components/Form';
import axios from 'axios';
import {theme} from '../../../theme';
import {icons} from '../../../assets';
export class UpdatePassword extends Component {
  state = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    email: '',
    spinner: false,
    toggleOldPassword: true,
    toggleNewPassword: true,
  };

  componentDidMount() {
    const {getParam} = this.props.navigation;
    this.setState({email: getParam('email', '')});
  }

  validateInput = () => {
    const {oldPassword, newPassword, confirmPassword} = this.state;
    let error = false;

    if (!error && (!oldPassword || oldPassword.length < 1))
      error = 'Please provide old password';
    if (!error && (!newPassword || newPassword.length < 8))
      error = 'Please provide minimum 8 characters new password';
    if (!error && (!confirmPassword || confirmPassword.length < 1))
      error = 'Please confirm new password';
    if (!error && newPassword !== confirmPassword)
      error = "Password doesn't match";

    if (error) {
      Snackbar.show({text: error, duration: Snackbar.LENGTH_SHORT});
      return false;
    }
    return true;
  };

  updateNewPassword = async () => {
    const isValid = this.validateInput();
    if (!isValid) return;

    // const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);

    this.setState({spinner: true});

    const reqBody = {
      oldPassword: this.state.oldPassword,
      password: this.state.newPassword,
      confirmPassword: this.state.confirmPassword,
    };

    try {
      await axios
        .post(api.ChangePassword, reqBody)
        .then(res => {
          if (res?.data != null) {
            this.setState({spinner: false});
            setTimeout(() => {
              Snackbar.show({
                text: res?.data?.message,
                duration: Snackbar.LENGTH_SHORT,
              });
            }, 100);
            if (res?.data?.isValid) {
              this.props.navigation.navigate('HomeScreen');
            }
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

    // fetch(api.ChangePassword, {
    //   method: 'post',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //     Authorization: 'Bearer ' + token,
    //   },
    //   body: reqBody,
    // })
    //   .then(response => response.json())
    //   .then(json => {
    //     this.setState({spinner: false});
    //     if (json.isValid) {
    //       Snackbar.show({text: json.message, duration: Snackbar.LENGTH_SHORT});
    //       this.props.navigation.navigate('HomeScreen');
    //     } else {
    //       setTimeout(
    //         function() {
    //           Snackbar.show({
    //             text: json.message,
    //             duration: Snackbar.LENGTH_LONG,
    //           });
    //         }.bind(this),
    //         100,
    //       );
    //     }
    //   })
    //   .catch(error => {
    //     this.setState({spinner: false});
    //     Snackbar.show({
    //       text: 'Old password does not match',
    //       duration: Snackbar.LENGTH_LONG,
    //     });
    //   });
  };

  cancelButtonPress = () => {
    const {firstName, lastName} = this.state;

    if (firstName === '' && lastName === '') {
      Snackbar.show({
        text: 'Please update fields',
        duration: Snackbar.LENGTH_LONG,
      });
      return;
    }
    this.props.navigation.goBack(null);
  };

  render() {
    return (
      <View>
        <Spinner visible={this.state.spinner} />

        <Header
          title="Change Password"
          leftButton={{title: 'Cancel', onPress: this.cancelButtonPress}}
          rightButton={{title: 'Update', onPress: this.updateNewPassword}}
        />

        <View style={styles.container}>
          <View
            style={{flexDirection: 'row', paddingTop: 20, paddingLeft: 20}}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Old Password"
              autoFocus={true}
              placeholderTextColor={theme.colors.colorPrimary}
              secureTextEntry={this.state.toggleOldPassword}
              onChangeText={text => this.setState({oldPassword: text})}
              value={this.state.oldPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  toggleOldPassword: !this.state.toggleOldPassword,
                });
              }}
              style={styles.toggleContainer}>
              <Image style={{}} source={icons.show_password} />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="New Password"
              placeholderTextColor={theme.colors.colorPrimary}
              secureTextEntry={this.state.toggleNewPassword}
              onChangeText={text => this.setState({newPassword: text})}
              value={this.state.newPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  toggleNewPassword: !this.state.toggleNewPassword,
                });
              }}
              style={styles.toggleContainer}>
              <Image style={{}} source={icons.show_password} />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm New Password"
              placeholderTextColor={theme.colors.colorPrimary}
              secureTextEntry={this.state.toggleNewPassword}
              onChangeText={text => this.setState({confirmPassword: text})}
              value={this.state.confirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => {
                this.setState({
                  toggleNewPassword: !this.state.toggleNewPassword,
                });
              }}
              style={styles.toggleContainer}>
              <Image style={{}} source={icons.show_password} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  passwordContainer: {
    width: '90%',
    alignSelf: 'center',
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
    borderColor: theme.colors.colorPrimary,
    borderWidth: 1,
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    color: theme.colors.black,
    paddingLeft: 4,
    fontSize: 17,
    height: '100%',
  },
  toggleContainer: {
    padding: 5,
    height: '100%',
    justifyContent: 'center',
  },
});
