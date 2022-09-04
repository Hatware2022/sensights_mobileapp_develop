import {
  Button,
  Image,
  Linking,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {
  appOptions,
  careHomesUsers,
  senSightsUsers,
  StorageUtils,
} from '../../utils';
import {ButtonGroup, CheckBox} from 'react-native-elements';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';
import {api, GET_COMPANIES} from '../../api';
import {sendRequest} from '../../apicall';
import {icons} from '../../assets';
import {styles} from './styles';
import {theme} from '../../theme';
import Pushy from 'pushy-react-native';
// import { PrimaryCheckbox, DropDown } from '../../components'
import {DropDown} from '../../components/DropDown';
import _ from 'lodash';
import axios from 'axios';

export const SignupForm = props => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [userType, setUserType] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [visibleVerifyPassword, setvisibleVerifyPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [userList, setUserList] = useState(senSightsUsers);
  const [compnayList, setCompnayList] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [error, setError] = useState(null);
  const [emailSend, setEmailSend] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const {isChecked, navigation, onCheckBoxPress, appType} = props;

  useEffect(() => {
    sendRequest({uri: GET_COMPANIES, method: 'get'})
      .then(r => {
        if (!r || !_.isArray(r) || r.error) {
          if (r.error) setError(r.error);
          return;
        }
        if (r) setCompnayList(r);
      })
      .catch(err => {});

    return () => {
      // effect
    };
  }, [props]);

  useEffect(() => {
    Linking.addEventListener("url", handleDeepLink);
    return () => {
      Linking.removeEventListener("url", handleDeepLink);
    };
  }, []);

  function handleDeepLink(event) {
    let url = event.url
    let splitedArr = url.split("code=");
    splitedArr && splitedArr.length > 0 && setEmailSend(true) || setEmailVerified(true)
  }  

  const showError = error => {
    setTimeout(
      function() {
        Snackbar.show({
          text: 'Error in creating account: ' + error.message,
          duration: Snackbar.LENGTH_LONG,
        });
      }.bind(this),
      100,
    );
  };

  const Regvalidate = text => {
    //update the regular expression because of new requirement. There should be atleast 3 character in name of email address.

    var emailLength = text.substring(0, text.indexOf('@'));
    if (emailLength.length < 3) {
      return false;
    }
    return true;
  };
  const validate = text => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(text) === false) {
      return false;
    }
    return true;
  };
  const validateInput = () => {
    if (!userName || userName.trim().length < 1) {
      showError(Error('Missing user name'));
      return false;
    }

    if (!email || email.length < 1) {
      showError(Error('Missing email address'));
      return false;
    }
    if (!validate(email)) {
      showError(Error('Enter a valid email'));
      return false;
    }
    if (!Regvalidate(email)) {
      showError(Error('Email name must contain at least 3 Alphanumerics'));
      return false;
    }
    if (!password || password.length < 1) {
      showError(Error('Missing password'));
      return false;
    }
    if (password.length < 8) {
      showError(Error('Password must be minimum 8 characters'));
      return false;
    }
    if (password !== verifyPassword) {
      showError(Error("Passwords didn't match. Try Again"));
      return false;
    }
    if (
      userType === 1 &&
      (!selectedCompany ||
        selectedCompany.length < 1 ||
        selectedCompany == null ||
        selectedCompany == 'null')
    ) {
      showError(Error('Missing company'));
      return false;
    }
    if (!isChecked) {
      showError(Error('Checkbox must be selected'));
      return false;
    }

    return true;
  };

  const registerPushyToken = async () => {
    await Pushy.register()
      .then(async pushy_token => {
        StorageUtils.storeInStorage('pushy_token', `${pushy_token}`);
      })
      .catch(err => {
        setLoading(false);
      });
  };

  const signUp = async () => {
    if (!validateInput()) return;
    setLoading(true);
    await registerPushyToken();
    var pushy_token = await StorageUtils.getValue('pushy_token');
    const body = new FormData();
    body.append('FirstName', userName);
    body.append('LastName', 'User');
    body.append('Email', email);
    body.append('Password', password);
    body.append('ConfirmPassword', password);
    body.append('ApplicationType', appType ? '2' : '1');
    // body.append("ApplicationType", appType+1)
    body.append('UserType', userType ? '2' : '1');
    body.append('deviceToken', pushy_token);

    // body.append("UserType", userType+1)
    if (userType === 1) body.append('CompanyId', selectedCompany);

    try {
      await axios
        .post(api.signUp, body)
        .then(res => {
          if (res?.data != null) {
            setEmailSend(true)
          }
          setLoading(false);
        })
        .catch(err => {
          setLoading(false);
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });
    } catch (err) {
      setLoading(false);
      Snackbar.show({
        text: 'Network Issue please try again',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const onChangeType = type => {
    setUserType(type);
    // if (type) setUserList(careHomesUsers);
    // else setUserList(senSightsUsers);
  };

  const renderText = text => (
    <Text
      style={{fontFamily: theme.fonts.SFProSemibold, color: theme.colors.black}}
      onPress={() => Linking.openURL(theme.strings.locateMotionWeb)}>
      {text}
    </Text>
  );

  return (
    <>
      <Spinner visible={isLoading} />

      <TextInput
        style={[
          theme.palette.textInputTransparentBg,
          {borderColor: theme.colors.colorPrimary, color: theme.colors.black},
        ]}
        placeholder="Username"
        placeholderTextColor={theme.colors.colorPrimary}
        keyboardType={'email-address'}
        value={userName}
        onChangeText={text => setUserName(text)}
      />
      <TextInput
        style={[
          theme.palette.textInputTransparentBg,
          {borderColor: theme.colors.colorPrimary, color: theme.colors.black},
        ]}
        placeholder="Email"
        placeholderTextColor={theme.colors.colorPrimary}
        keyboardType={'email-address'}
        value={email}
        onChangeText={text => setEmail(text)}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor={theme.colors.colorPrimary}
          secureTextEntry={!showPassword}
          onChangeText={text => setPassword(text)}
          value={password}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIconStye}>
          <Image style={{}} source={icons.show_password} />
        </TouchableOpacity>
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Verify Password"
          placeholderTextColor={theme.colors.colorPrimary}
          secureTextEntry={!visibleVerifyPassword}
          onChangeText={text => setVerifyPassword(text)}
          value={verifyPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={() => setvisibleVerifyPassword(!visibleVerifyPassword)}
          style={styles.eyeIconStye}>
          <Image style={{}} source={icons.show_password} />
        </TouchableOpacity>
      </View>

      {userType === 1 && (
        <View
          style={[
            theme.palette.textInputTransparentBg,
            {
              paddingLeft: 0,
              borderColor: theme.colors.colorPrimary,
              color: theme.colors.black,
            },
          ]}>
          <DropDown
            style={{
              backgroundColor: '#FFF',
              minHeight: 30,
              width: '100%',
              borderRadius: 10,
            }}
            textStyle={{color: theme.colors.black}}
            placeholderStyle={{color: theme.colors.colorPrimary}}
            data={compnayList.map(item => ({
              value: item.id,
              label: item.companyname,
            }))}
            placeholder="Compnay Name"
            value={selectedCompany}
            onChange={(value, index, item) => {
              setSelectedCompany(value);
              // changeSelectedValue(value, index, item)
            }}
          />
        </View>
      )}

      <View style={{marginTop: 50, justifyContent: 'flex-end'}}>
        <ButtonGroup
          onPress={onChangeType}
          selectedIndex={userType}
          buttons={appType == 1 ? careHomesUsers : senSightsUsers}
          containerStyle={styles.buttonGroupContainer}
          textStyle={styles.buttonGroupText}
          selectedButtonStyle={styles.selectedButton}
          selectedTextStyle={styles.selectedButtonText}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}>
        <CheckBox
          checked={isChecked}
          onPress={onCheckBoxPress}
          containerStyle={{width: 31}}
          size={32}
          center={true}
          checkedColor={theme.colors.colorPrimary}
          uncheckedColor={theme.colors.colorPrimary}
          ico
        />
        <Text style={styles.termsPolicyText}>
          By checking this box, you agree to the{' '}
          {renderText('Terms and Privacy Policy')}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.buttonWhiteBg, {marginTop: 8}]}
        onPress={signUp}>
        <Text
          style={[
            theme.palette.buttonTextPrimary,
            {color: theme.colors.white},
          ]}>
          Create Account
        </Text>
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
      {/* <TouchableOpacity style={{borderWidth:1, padding:20, margin:20}} onPress={()=>{
                navigation.navigate("ResetPassword", {
                  Email: "email", Password: "password",
                  UserType: "1", AppType: "1",
                });        
      }}><Text>Code Verification Registration</Text></TouchableOpacity> */}
    </>
  );
};
