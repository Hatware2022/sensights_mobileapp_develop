import {AppConstants, StorageUtils, showMessage} from './src/utils';
import {AppContainer, api, theme} from './src';
import {Platform, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import React, {Component} from 'react';
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

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      loading: false,
      alertId: '',
      inviteId: '',
      inviteTitle: '',
      inviteDescription: '',
      visibleUpdate: false,
      msg: 'Hello world',
    };

    AuthService.init();
  }

  async componentDidMount() {
    // Start the Pushy service
    axiosinterceptor();
    setTimeout(() => {
      Pushy.listen();
    }, 6000);

    await this.initPushy()
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
      this.onLocalNotification,
    );

    this.getPermissions();
  }

  // update senior location on pushy notification

  postCurrentLocation = async (latitude, longitude) => {
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
  getLocation = async () => {
    return BackgroundGeolocation.getCurrentPosition({
      timeout: 30, // 30 second timeout to fetch location
      persist: true, // Defaults to state.enabled
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
  updateLocationNow = async () => {
    // this.setState({spinner: true});
    const currentLocation = await this.getLocation();
    const lati = currentLocation['coords'].latitude;
    const longi = currentLocation['coords'].longitude;
    this.postCurrentLocation(lati, longi);
  };
  async getPermissions() {
    const granted = await grantAllPermissions();
    return granted;
  }
  notificationNavigation = () => {
    // call navigate for AppNavigator here:
    this.navigator &&
      this.navigator.dispatch(
        NavigationActions.navigate({routeName: 'AlertsScreen'}),
      );
  };

  initPushy = async props => {
    // Read click on pushy notification
    Pushy.setNotificationClickListener(async data => {
      // Display basic alert

      const parseData = JSON.parse(data.message);
      if (parseData?.AlertTypeId == '18') {
        this.updateLocationNow();
      }

      this.notificationNavigation();
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
          this.showDialog(title, message, payload);
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

  showDialog = (Title, Body, {InviteId, AlertId}) => {
    this.setState({
      visible: true,
      inviteId: InviteId,
      alertId: AlertId,
      inviteTitle: Title,
      inviteDescription: Body,
    });
  };

  onAction = async type => {
    this.setState({loading: true, visible: false});
    try {
      const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
      const url = `${api.invites}/${this.state.inviteId}/${type}`;

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
          this.acknowledgeAlert(token);
          showMessage(`Request ${type === 'Accept' ? 'accepted' : 'rejected'}`);
        }
      } else {
        this.setState({loading: false});
        showMessage(
          `Error in ${type === 'Accept' ? 'accepting' : 'rejecting'} invite`,
        );
      }
    } catch (error) {
      this.setState({loading: false});
      showMessage(
        `Error in ${type === 'Accept' ? 'accepting' : 'rejecting'} invite`,
      );
    }
  };

  acknowledgeAlert = async token => {
    try {
      const url = `${api.alerts}/${this.state.alertId}/Acknowledge`;
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
          this.setState({loading: false});
        }
      } else {
        this.setState({loading: false});
        showMessage(`Error in acknowledging alert`);
      }
    } catch (error) {
      this.setState({loading: false});
      showMessage(`Error in acknowledging alert`);
    }
  };

  checkVersion = async () => {
    fetch(api.version)
      .then(response => response.json())
      .then(result => {
        if (result && result.versionNumber !== VERSION) {
          this.setState({visibleUpdate: true});
        }
      })
      .catch(e => {
        showMessage('Error in gettin app version');
      });
  };

  onLocalNotification = notification => {
    this.notificationNavigation();
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <Spinner visible={this.state.loading} />
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.colors.colorPrimary}
        />
        <View style={{flex: 1}}>
          <AppContainer
            ref={nav => {
              this.navigator = nav;
            }}
          />
        </View>
        <AlertHelper />
        {/* Request Dialog */}
        <RNDialog.Container
          visible={this.state.visible}
          style={this.state.visible ? {} : {height: 0}}>
          <RNDialog.Title>{this.state.inviteTitle}</RNDialog.Title>
          <RNDialog.Description>
            {this.state.inviteDescription}
          </RNDialog.Description>
          <RNDialog.Button
            label={'Reject'}
            onPress={() => this.onAction('Reject')}
            bold
          />
          <RNDialog.Button
            label={'Approve'}
            onPress={() => this.onAction('Accept')}
            bold
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 8,
            }}>
            <TouchableOpacity onPress={() => this.setState({visible: false})}>
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
          visible={this.state.visibleUpdate}
          style={this.state.visibleUpdate ? {} : {height: 0}}>
          <RNDialog.Title>Update</RNDialog.Title>
          <RNDialog.Description>
            Please update your app, A newer version is available.
          </RNDialog.Description>
          <RNDialog.Button
            label={'Cancel'}
            onPress={() => this.setState({visibleUpdate: false})}
          />
        </RNDialog.Container>

        <ActivityScore />

        <Connecty />
      </View>
    );
  }
}
