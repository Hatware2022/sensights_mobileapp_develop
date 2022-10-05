import {AppConstants, StorageUtils, showMessage} from './src/utils';
import {AppContainer, api, theme} from './src';
import {Platform, StatusBar, Text, TouchableOpacity, View, Linking} from 'react-native';
import React, {useEffect,useRef,useState} from 'react';
import {AlertHelper} from './src/components';
import RNDialog from 'react-native-dialog';
import Spinner from 'react-native-loading-spinner-overlay';
import Snackbar from 'react-native-snackbar';
import {VERSION} from './version';
import ActivityScore from './src/screens/main/ActivityScore';
import Pushy from 'pushy-react-native';
import {AuthService} from './src/Connecty/services';
import Connecty from './src/Connecty';
import {grantAllPermissions} from './src/utils/permissionHandler';
import {NavigationActions} from 'react-navigation';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import axiosinterceptor from './src/AxiosApi';
import BackgroundGeolocation from 'react-native-background-geolocation';
import axios from 'axios';
import {EventRegister} from 'react-native-event-listeners';
Pushy.toggleInAppBanner(true);
Pushy.setNotificationListener(async data => {
  var payload = {
    title: 'Sensight Notification',
    message: data.message || '...',
  };
   EventRegister.emit('myCustomEvent', JSON.parse(data?.message));
  if (data.message) {
    try {
      payload = JSON.parse(data.message);
    } catch (error) {}
  }

  if (Platform.OS === 'android')
    Pushy.notify(payload.title, payload.message, data);
  Pushy.setBadge && Pushy.setBadge(0);
});

// Set pushy Notification Icon
if (Platform.OS === 'android') Pushy.setNotificationIcon('ic_launcher');

// export default class App extends Component {
  export const App = props => {
    const[visible,setVisible]=useState(false)
    const[loading,setLoading]=useState(false)
    const[alertId,setAlertId]=useState('')
    const[inviteId,setInviteId]=useState('')
    const[inviteTitle,setInviteTitle]=useState('')
    const[inviteDescription,setInviteDescription]=useState('')
    const[visibleUpdate,setVisibleUpdate]=useState(false)
    const[msg,setMsg]=useState('Hello world')

    AuthService.init();
    let navigator = useRef();




   const handleDeepLink = (event) => {
        let url = event.url
        let resetPasswordParams = url.split(Platform.OS==='ios'?'ResetPassword':'resetpassword');
        let resetPasswordP = url.split('ResetPassword');
        let signupParams = url.split('confirmation');
        let queryparams = url.split('?')[1];
        let params = queryparams.split('&');
      if((resetPasswordParams && resetPasswordParams.length > 1) 
      || (resetPasswordP && resetPasswordP.length > 1)){
        let code = params[1].replace("code=","")
        let email = params[2].replace("email=","")
        navigator &&
        navigator.dispatch(
          NavigationActions.navigate({routeName: 'ResetPassword',params:{
          email: email,
          code: code,
          }}),
        );
      }
      if(signupParams && signupParams.length > 1){
        console.log('signupParams ; ',signupParams)
        verificationLink(params[0],params[1])
      }
  }  

  async function verificationLink(token,code) {
    try {
       axios.get(`${api.confirmPasswordForRegistrationTest}?${token}&${code}`)
        .then(res => {
          if (res?.data != null) {   
          }
        })
        .catch(err => {
          console.log('err : ',err)
          // return false;
        });
    } catch (err) {
      return false;
    }
    navigator &&
    navigator.dispatch(
      NavigationActions.navigate({routeName: 'Login',params:{
        emailSend: true,
        emailVerified: true,
      }}));
  }

  useEffect(() => {
    Linking.addEventListener("url", handleDeepLink);
        // Start the Pushy service
        axiosinterceptor();
        setTimeout(() => {
          Pushy.listen();
        }, 6000);
    
         initPushy()
          .then(r => {
            // Snackbar.show({ text: `Notification Token Generated`, duration: Snackbar.LENGTH_SHORT, });
          })
          .catch(err => {
            Snackbar.show({
              text: `Unexected Error while Generating Notification token`,
              duration: Snackbar.LENGTH_SHORT,
            });
          });
    
        PushNotificationIOS.addEventListener(
          'notification',
           onLocalNotification,
        );
    
         getPermissions();
    return () => {
      Linking.removeEventListener("url", handleDeepLink);
    }; 
  }, []);


  // update senior location on pushy notification
  const postCurrentLocation = async (latitude, longitude) => {
    try {
      await axios
        .post(api.seniorLocations, {
          latitude: latitude,
          longitude: longitude,
          isWatchPaired: true,
        })
        .then(res => {})
        .catch(err => {});
    } catch (err) {}
  };

  const getLocation = async () => {
    return BackgroundGeolocation.getCurrentPosition({
      timeout: 30, // 30 second timeout to fetch location
      persist: true, // Defaults to  enabled
      maximumAge: 5000, // Accept the last-known-location if not older than 5000 ms.
      desiredAccuracy: 10, // Try to fetch a location with an accuracy of `10` meters.
      samples: 3, // How many location samples to attempt.
      extras: {
        // Custom meta-data.
        route_id: 123,
      },
    }).then(currentlocation => {
      return currentlocation;
    });
  };

  const updateLocationNow = async () => {
    const currentLocation = await  getLocation();
    const lati = currentLocation['coords'].latitude;
    const longi = currentLocation['coords'].longitude;
     postCurrentLocation(lati, longi);
  };

  async function getPermissions() {
    const granted = await grantAllPermissions();
    return granted;
  }

  const notificationNavigation = () => {
    // call navigate for AppNavigator here:
    navigator &&
      navigator.dispatch(
        NavigationActions.navigate({routeName: 'AlertsScreen'}),
      );
  };

  const initPushy = async props => {
    // Read click on pushy notification
    Pushy.setNotificationClickListener(async data => {
      // Display basic alert

      const parseData = JSON.parse(data.message);
      if (parseData?.AlertTypeId == '18') {
        updateLocationNow();
      }

      notificationNavigation();
      var payload = false;
      if (data.message) {
        try {
          payload = JSON.parse(data.message);
        } catch (error) {}
      }
      if (!payload) return;

      const {title, message, InviteId} = payload;

      if (message && title) {
        if (InviteId && title.startsWith('Added By')) {
          showDialog(title, message, payload);
        }
      }
    });

    // Register pushy to a specific topic
    await Pushy.isRegistered().then(isRegistered => {
      if (isRegistered) {
        // Subscribe the user to a topic
        Pushy.subscribe('sensightglobal')
          .then(() => {
            // Subscribe successful
          })
          .catch(err => {
            // Handle errors
            console.error(err);
          });
      }
    });
  };

 const showDialog = (Title, Body, {InviteId, AlertId}) => {
      setVisible(true)
      setInviteId(InviteId)
      setAlertId(AlertId)
      setInviteTitle(Title)
      setInviteDescription(Body)
  };

  const onAction = async type => {
     setLoading(true) 
     setVisible(false)
     try {
      const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
      const url = `${api.invites}/${  inviteId}/${type}`;

      const response = await fetch(url, {
        method: 'put',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      if (response.ok) {
        const json = await response.json();
        if (json) {
           acknowledgeAlert(token);
          showMessage(`Request ${type === 'Accept' ? 'accepted' : 'rejected'}`);
        }
      } else {
         setLoading(false) 
        showMessage(
          `Error in ${type === 'Accept' ? 'accepting' : 'rejecting'} invite`,
        );
      }
    } catch (error) {
      setLoading(false) 
      showMessage(
        `Error in ${type === 'Accept' ? 'accepting' : 'rejecting'} invite`,
      );
    }
  };

 const acknowledgeAlert = async token => {
    try {
      const url = `${api.alerts}/${alertId}/Acknowledge`;
      const response = await fetch(url, {
        method: 'put',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });
      if (response.ok) {
        const json = await response.json();
        if (json) {
          setLoading(false) 
        }
      } else {
        setLoading(false) 
        showMessage(`Error in acknowledging alert`);
      }
    } catch (error) {
      setLoading(false) 
      showMessage(`Error in acknowledging alert`);
    }
  };

 const checkVersion = async () => {
    fetch(api.version)
      .then(response => response.json())
      .then(result => {
        if (result && result.versionNumber !== VERSION) {
           setVisibleUpdate(true)
        }
      })
      .catch(e => {
        showMessage('Error in gettin app version');
      });
  };

 const onLocalNotification = notification => {
    notificationNavigation();
  };

    return (
      <View style={{flex: 1}}>
        <Spinner visible={ loading} />
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.colorPrimary}
        />
        <View style={{flex: 1}}>
          <AppContainer
            ref={nav => {
              navigator = nav;
            }}
          />
        </View>
        <AlertHelper />
        {/* Request Dialog */}
        <RNDialog.Container
          visible={  visible}
          style={  visible ? {} : {height: 0}}>
          <RNDialog.Title>{  inviteTitle}</RNDialog.Title>
          <RNDialog.Description>
            {  inviteDescription}
          </RNDialog.Description>
          <RNDialog.Button
            label={'Reject'}
            onPress={() =>  onAction('Reject')}
            bold
          />
          <RNDialog.Button
            label={'Approve'}
            onPress={() =>  onAction('Accept')}
            bold
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 8,
            }}>
            <TouchableOpacity onPress={() =>  setVisible(false)}>
              <Text
                style={{
                  color: Platform.OS === 'ios' ? '#007ff9' : '#169689',
                  fontSize: 18,
                }}>
                Ignore
              </Text>
            </TouchableOpacity>
          </View>
        </RNDialog.Container>

        {/* Update Dialog */}
        <RNDialog.Container
          visible={  visibleUpdate}
          style={  visibleUpdate ? {} : {height: 0}}>
          <RNDialog.Title>Update</RNDialog.Title>
          <RNDialog.Description>
            Please update your app, A newer version is available.
          </RNDialog.Description>
          <RNDialog.Button
            label={'Cancel'}
            onPress={() => setVisibleUpdate(false)}
          />
        </RNDialog.Container>

        <ActivityScore />

        <Connecty />
      </View>
    );
}

