import React, {useEffect, useState} from 'react';
import ZendeskChat from 'react-native-zendesk-chat';
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Image,
  StatusBar,
  Linking,
} from 'react-native';
import styles from './style';
import {AppConstants, showMessage, StorageUtils} from '../../../utils';
import {api} from '../../../api';
import Spinner from 'react-native-loading-spinner-overlay';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';
import {EventRegister} from 'react-native-event-listeners';
import {icons} from '../../../assets';
import {Button, ListItem} from 'react-native-elements';
import {theme} from '../../../theme';
import {AuthService} from '../../../Connecty/services';
import moment from 'moment';
export default function TechSupport({navigation}) {
  const [ProfileData, setProfileData] = useState({});
  const [loading, setloading] = useState(false);
  const [Responceerror, setError] = useState(false);
  const [reload, setReload] = useState(false);
  useEffect(() => {
    setloading(true);
    ZendeskChat.init('0yfHwKxiMpRco8iMeF219TcD6hDKVucS');
    loadPageData();
  }, [reload]);
  const loadPageData = async () => {
    Profiletoken = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
    ProfileId = await StorageUtils.getValue(AppConstants.SP.USER_ID);
    getProfileData();
  };
  const getProfileData = async () => {
    try {
      await axios
        .get(api.techSupport)
        .then(res => {
          if (res?.data != null) {
            setProfileData(res?.data);
            setError(false);
          }
          setloading(false);
        })
        .catch(err => {
          setloading(false);
          setError(true);
          setTimeout(() => {
            Snackbar.show({
              text: err?.description
                ? err?.description
                : 'Sorry, Server not responding',
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });
    } catch (err) {
      setloading(false);
      setError(true);
      showMessage('Internet issue.');
    }
  };
  const _onPressChatButton = async () => {
    // setReload(!reload);
    // debugger;
    ZendeskChat.startChat({
      visitorInfo: {
        name: ProfileData?.firstName,
        //  `${ProfileData?.firstName} ${ProfileData?.lastName}`
        email: ProfileData?.email,
        phone: ProfileData?.phone,
      },
      behaviorFlags: {
        showAgentAvailability: true,
        showChatTranscriptPrompt: true,
        showPreChatForm: false,
        showOfflineForm: true,
      },
      preChatFormOptions: {
        name: 'required',
        email: 'hidden',
        phone: 'hidden',
        department: 'hidden',
      },
      localizedDismissButtonTitle: 'Dismiss',
    });
  };
  const generateEmail = () => {
    Linking.openURL(
      'mailto:support@locatemotion.com?subject=Sensights Care Technical Support',
    );
  };
  const callHelp = async () => {
    if (!AuthService.isLoggedIn) {
      alert('You are not logged into Audio server');
      return;
    }
    EventRegister.emit('onMakeConnectyAudioCall', {...ProfileData});
  };
  if (loading) return <Spinner visible={loading} />;
  const renderItem = (title, icon, topDivider) => (
    <ListItem
      topDivider={topDivider}
      title={title}
      containerStyle={{width: '100%', paddingHorizontal: 17}}
      leftIcon={{name: icon, color: theme.colors.colorPrimary}}
      bottomDivider
    />
  );
  const ErrorHandler = () => {
    return (
      <View style={styles.retryContainer}>
        <Text>it seems like a problem with your network.</Text>
        <TouchableOpacity
          onPress={() => {
            setReload(!reload);
          }}>
          <Text style={styles.retryButtonTitle}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#25BEED" barStyle="dark-content" />
      <View style={styles.headerContainer}>
        <Image
          source={icons.techSupport}
          style={styles.imgStyle}
          resizeMode="stretch"
        />
        <View style={styles.headerAbsoluteContainer}>
          <TouchableOpacity
            style={styles.backButtonContainer}
            onPress={() => navigation.goBack()}>
            <Text style={styles.BackButtonTitle}>Back</Text>
          </TouchableOpacity>
          <View style={styles.TechStatusContainer}>
            <Text style={styles.TechTextStyle}>
              {ProfileData?.firstName + ' ' + ProfileData?.lastName}
            </Text>
            <Text style={styles.TechOnlineStatus}>
              Status: {ProfileData?.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>
      {Responceerror ? (
        <ErrorHandler />
      ) : (
        <>
          <View style={styles.contactSupportContainer}>
            <Text style={styles.contactSupportText}>CONTACT SUPPORT</Text>
            <View style={styles.contactSupportButtonGroup}>
              <Button
                title={'AUDIO'}
                icon={{name: 'call', color: 'white', size: 20}}
                buttonStyle={styles.buttonIconStyle}
                raised
                onPress={() => callHelp()}
              />
              <Button
                title="EMAIL"
                icon={{name: 'email', color: theme.colors.white}}
                buttonStyle={{
                  ...styles.buttonIconStyle,
                  backgroundColor: '#F29812',
                }}
                raised
                onPress={() => generateEmail()}
              />
              <Button
                title="CHAT"
                icon={{name: 'sms', color: theme.colors.white}}
                buttonStyle={{
                  ...styles.buttonIconStyle,
                  backgroundColor: '#2550EA',
                }}
                raised
                onPress={() => _onPressChatButton()}
              />
            </View>
          </View>
          <View style={styles.contactSupportContainer}>
            <Text style={styles.contactSupportText}>SUPPORT HOURS</Text>
            <View style={styles.supportHoursContainer}>
              <Text style={styles.supportHoursText}>Monday-Friday</Text>
              <Text style={styles.supportHoursText}>
                {moment(ProfileData?.shiftStartTime).format('HH:mm A') +
                  ' - ' +
                  moment(ProfileData?.shiftEndTime).format('hh:mm A')}
              </Text>
            </View>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.contactSupportText}>DETAILS</Text>
            {renderItem(ProfileData.email, 'email', true)}
            {renderItem(ProfileData.phone, 'phone')}
            {renderItem(ProfileData.address, 'home')}
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
