import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Modal,
  Image,
  Button,
  AsyncStorage
} from 'react-native';
import React, {Component, useState,useEffect} from 'react'; 

import Snackbar from 'react-native-snackbar';
import {api} from '../../api';
import {theme} from '../../theme';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import {showMessage} from '../../utils';
// export class ForgotPassword extends Component {
  export const ForgotPassword = props => {
    const[spinner,setSpinner]=useState(false)
    const[email,setEmail]=useState('')
    const [emailSend, setEmailSend] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

 var containerProps = {style: styles.inputWrapStyle};

 const validate = text => {
    console.log(text);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      return false;
    }
    return true;
  };

 const onFinishCheckingCode = code => {
    console.log(code);
  };

 const cellProps = ({/*index, isFocused,*/ hasValue}) => {
    if (hasValue) {
      return {
        style: [styles.input, styles.inputNotEmpty],
      };
    }
    return {
      style: styles.input,
    };
  };

  useEffect(() => {

    Linking.addEventListener("url", handleDeepLink);
    return () => {
      Linking.removeEventListener("url", handleDeepLink);
    }; 
  }, []);

  function handleDeepLink(event) {
    let url = event.url
    let splitedArr = url.split("/resetpassword?token=");
    splitedArr && splitedArr.length > 0 &&      props.navigation.navigate('ResetPassword', {
      email: email,
    });
  }  

 const handleChange = (name, value) => {
   setEmail(value)
   AsyncStorage.setItem('email',value)
  };

 const sendMail = async () => {
  setSpinner(false)
  setEmailSend(true)
    let message = '';
    if (email.length == 0 || !validate(email)) {
      message = theme.strings.enter_email;
      if (message.length > 0) {
        Snackbar.show({text: message, duration: Snackbar.LENGTH_SHORT});
        return;
      }
    }
    var body = {email: email};

    try {
      setSpinner(true)
      await axios
        .post(api.forgotPassword, body)
        .then(res => {
          if (res?.data != null) {
            setSpinner(false)
            setEmailSend(true)
            // setTimeout(() => {
            //   Snackbar.show({
            //     text: res?.data.message,
            //     duration: Snackbar.LENGTH_SHORT,
            //   });
            // }, 100);
            // props.navigation.navigate('ResetPassword', {
            //   email: email,
            // });
          }
        })
        .catch(err => {
          setSpinner(false)

          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });
    } catch (err) {
      setSpinner(false)
      showMessage('Network issue try again');
    }
  };

 const showError = () => {
    Snackbar.show({
      text: theme.strings.call_fail_error,
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  // render() {
    return (
      <View style={styles.container}>
        {/* <View style={{ marginTop: Platform.OS === "ios" ? 15 : 35 }} /> */}
        <Spinner visible={spinner} />
        <Text style={styles.title}>{theme.strings.forgot_password}</Text>
        <TextInput
          style={[theme.palette.textInputTransparentBg, styles.inputField]}
          placeholder={theme.strings.email}
          placeholderTextColor={theme.colors.white}
          keyboardType={'email-address'}
          onChangeText={text => handleChange('email', text)}
        />

        <TouchableOpacity
          onPress={sendMail}
          activeOpacity={0.8}
          style={[theme.palette.buttonWhiteBg, styles.submitButton]}>
          <Text style={theme.palette.buttonTextPrimary}>
            {theme.strings.send_mail}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => props.navigation.goBack()}
          activeOpacity={0.8}>
          <Text style={styles.cancel}>{theme.strings.cancel}</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={emailSend}
          onRequestClose={() => setShowModal(false)}>
              <View style={styles.card}>
                  <Image source={require('../../assets/images/tick.png')} style={styles.modalImg}/>
                  <Text style={styles.modalHeading}>{emailVerified ? 'Verified' : 'Email Sent'}</Text>
                  <Text style={styles.modalTxt}>{emailVerified ? 'Your Email has been confirmed. Please go back to login page.' : 'Please check your email for verification link'}</Text>
                <View style={styles.modalBtn}>
                 <Button title='OK' onPress={()=>emailVerified ? setEmailVerified(false) || setEmailSend(false)  : setEmailSend(false)} />
                 </View>
              </View>
        </Modal>
      </View>
    );
  }
// }

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
  modalBtn: {
    width: 70, 
    alignSelf: 'center', 
    marginTop: 30, 
    marginBottom: 10
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
});
