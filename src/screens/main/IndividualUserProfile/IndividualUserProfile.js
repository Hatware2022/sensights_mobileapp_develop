import {
  AppConstants,
  StorageUtils,
  getAppUsers,
  showMessage,
  AppWidgets,
} from '../../../utils';
import {
  Platform,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {Badge, ListItem as EListItem} from 'react-native-elements';
import {
  ImageProfile,
  NoDataState,
  PersonalDetail,
  UserSettings,
  CustomSwitch,
} from '../../../components';
import React, {Component} from 'react';
import {EventRegister} from 'react-native-event-listeners';
import {icons, images} from '../../../assets';
import BackgroundTimer from 'react-native-background-timer';
import RNDialog from 'react-native-dialog';
import Spinner from 'react-native-loading-spinner-overlay';
import {api} from '../../../api';
import {styles} from './styles';
import {fetchApiData} from '../../../apicall';
import {clearLocalProfile} from '../../../utils/updater';
import {AuthService} from '../../../Connecty/services';
import Pushy from 'pushy-react-native';
import {NavigationActions, StackActions} from 'react-navigation';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';

const tabItems = [
  {
    name: 'F',
    value: 'F',
    headerBgColor: '#E702DD',
    icon: 'stats_bp_icon',
    unit: 'per min',
  },
  {
    name: 'C',
    value: 'C',
    bgGradient: ['#007AFF', '#0151A8'],
    headerBgColor: '#0466cf',
    icon: 'stats_bpm_icon',
    unit: 'mmHg',
  },
];

const tabItemsBP = [
  {
    name: 'mmol/L',
    value: '1',
    headerBgColor: '#E702DD',
    icon: 'stats_bp_icon',
    unit: 'mmol/L',
  },
  {
    name: 'mg/dL',
    value: '2',
    bgGradient: ['#007AFF', '#0151A8'],
    headerBgColor: '#0466cf',
    icon: 'stats_bpm_icon',
    unit: 'mg/dL',
  },
];

export class IndividualUserProfile extends Component {
  constructor(props) {
    super(props);
    this.profileData = this.props.navigation.getParam('profileData');
    this.state = {
      role: this.props.role,
      dialog: false,
      spinner: false,
      refreshing: false,
      loading: true,
      caregiverList: [],
      user: ['', ''],
      selectedIndex: 1,
      selectedIndexBp: 0,
      profileListData: [],
      profileData: null,
      isPrimary: false,
    };

    this.token = '';
  }

  focusListener = null;

  async componentDidMount() {
    // console.log("inside profile")
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      // The screen is focused
      this.loadPageData();
    });

    this.loadPageData();
  }

  componentWillUnmount() {
    // Remove the event listener
    if (this.focusListener) this.focusListener.remove();
  }

  async loadPageData() {
    this.setState({loading: true});
    if (Platform.OS !== 'ios') {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('transparent');
    }

    this.getTempDefaultValue();
    this.getBpDefaultValue();
    // this.getRole()
    this.token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
    this.seniorId = await StorageUtils.getValue(AppConstants.SP.USER_ID);
    this.getProfileData();
    // this.getIndividualsData();
    getAppUsers((u, type) => {
      this.setState({user: u, appType: type});
    });
    this.checkVisibility();
    this.fetchCaregivers();
  }
  openPrivacyPolicy = () => {
    Linking.openURL('https://sensights.ai//privacy-policy//').catch(err => {
      alert('Not able to open the Privacy Policy');
    });
  };
  checkVisibility = async () => {
    const {navigation, getWidgetsSettings, role, apptype} = this.props;
    getWidgetsSettings();

    const careCirclePref = await StorageUtils.getValue(AppWidgets.CARE_CIRCLE);
    const mediacationPref = await StorageUtils.getValue(AppWidgets.MEDIACATION);
    const allergiesPref = await StorageUtils.getValue(AppWidgets.ALLERGIES);
    const assessmentPref = await StorageUtils.getValue(
      AppWidgets.ASSESSMENT_RESULT,
    );

    this.isShowCareCircle = !!careCirclePref
      ? JSON.parse(careCirclePref)
      : true;
    this.isShowMedication = !!mediacationPref
      ? JSON.parse(mediacationPref)
      : true;
    this.isShowAllergies = !!allergiesPref ? JSON.parse(allergiesPref) : true;
    this.isShowAssessment = !!assessmentPref
      ? JSON.parse(assessmentPref)
      : true;

    // var appType;
    // getAppUsers((user, type) => {
    //   appType = type;
    // })

    let profileSettingsList = [];

    // profileSettingsList.push({
    //     title: "Personal Profile",
    //     onPress: () => this.navigateToEditProfile(),
    //   })

    profileSettingsList.push({
      title: 'Password',
      right: '12344566',
      onPress: () => {
        navigation.navigate('UpdatePasswordScreen', {
          email: this.state.profileData.email || '',
        });
      },
      key: 'device-units',
    });

    profileSettingsList.push({
      title: 'Regional Settings',
      onPress: () => {
        navigation.navigate('DeviceUnitsScreen', {
          profileData: this.state.profileData,
        });
      },
      key: 'device-units',
    });
    profileSettingsList.push({
      title: 'Medical Record',
      onPress: () => {
        navigation.navigate('MedicalReport', {
          profileData: this.state.profileData,
        });
      },
      key: 'medical_report',
    });
    profileSettingsList.push({
      title: 'Widgets Setting',
      onPress: () =>
        navigation.navigate('WidgetsSettings', {
          onReloadWidgetCallBack: () => this.checkVisibility(),
          role: role,
          apptype: apptype,
        }),
      key: 'widgets_settings',
    });
    profileSettingsList.push({
      title: 'Alerts Setting',
      onPress: () =>
        navigation.navigate('StatisticAlerts', {seniorId: this.seniorId}),
      key: 'statistic_alerts',
    });
    profileSettingsList.push({
      title:
        this.state.appType === 1 || this.state.appType === '1'
          ? 'Caregivers'
          : 'Supervisors',
      // title: this.state.user[this.state.appType - 1],
      onPress: () => this.setState({dialog: true}),
      key: 'caregiver-details',
    });
    if (this.isShowCareCircle) {
      apptype === '1' &&
        profileSettingsList.push({
          title: 'Care Circle',
          onPress: () => navigation.navigate('CareCircleScreen'),
          key: 'care-circle',
        });
    }
    profileSettingsList.push({
      title: 'Privacy Settings',
      onPress: () => navigation.navigate('PrivacySettings'),
      key: 'privacy-settings',
    });
    profileSettingsList.push({
      title: 'Paired Devices',
      onPress: () => navigation.navigate('DevicesScreen'),
      key: 'paired-devices',
    });

    if (this.isShowMedication) {
      apptype === '1' &&
        profileSettingsList.push({
          title: 'Medication',
          onPress: () => navigation.navigate('MedicationScreen'),
          key: 'medication',
        });
    }
    if (this.isShowAllergies) {
      apptype === '1' &&
        profileSettingsList.push({
          title: 'Allergies',
          onPress: () => navigation.navigate('AlergiesScreen'),
          key: 'alergies',
        });
    }
    if (this.isShowAssessment) {
      apptype === '1' &&
        profileSettingsList.push({
          title: 'Assessments',
          onPress: () => navigation.navigate('Assessments'),
          key: 'assessments',
        });
    }

    profileSettingsList.push({
      title: 'Privacy Policy',
      onPress: () => this.openPrivacyPolicy(),
      key: 'privacy-policy',
    });

    // profileSettingsList.push({
    //   title: "Preferences",
    //   onPress: () => navigation.navigate("PreferencesScreen"),
    //   key: "preferences",
    // })

    this.setState({profileListData: profileSettingsList});
  };

  getProfileData = async () => {
    const id = this.profileData.seniorId;

    let primaryuri = `https://stage01.sensights.ai:8080/api/Seniors/IsPrimary/caregiver/${id}`;

    try {
      await axios
        .get(primaryuri)
        .then(async response => {
          if (response != null) {
            // console.log("is Primary",response?.data)
            this.setState({
              isPrimary: response?.data,
            });
          }
        })
        .catch(err => {
          console.log('true or false', err.response);
        });
    } catch {
      console.log('individual', error.response);
    }

    let uri = `https://stage01.sensights.ai:8080/api/Accounts/Profile/Profile/${id}`;

    try {
      await axios
        .get(uri)
        .then(async res => {
          if (res?.data != null) {
            // await this.getAlertsFromServer();
            this.setState({
              profileData: res?.data,
              role: res?.data.roleName,
              loading: false,
            });
            // console.log("individual data found",res?.data)
            // this.showMessage('Marked as read alerts');
          }
          // this.setState({loading: false});
        })
        .catch(err => {
          console.log('individual', err.response);
        });
    } catch (error) {
      console.log('individual', error.response);
    }
  };

  getTempDefaultValue = async () => {
    await StorageUtils.getValue(AppConstants.SP.DEFAULT_TEMP_UNIT).then(
      value => {
        this.setState({selectedIndex: value == 'F' ? 0 : 1});
      },
    );
  };

  getBpDefaultValue = async () => {
    await StorageUtils.getValue(AppConstants.SP.DEFAULT_GLUCOSE_UNIT).then(
      value => {
        this.setState({selectedIndexBp: value == '1' ? 0 : 1});
      },
    );
  };

  navigateToEditProfile = () => {
    const {role, profileData} = this.state;
    const {navigation} = this.props;

    navigation.navigate('EditProfileScreen', {
      ...profileData,
      role: role,
      onRefreshCallBack: () => this.getProfileData(),
      careHomeLocation: profileData?.careHomeOffice || 0,
    });
  };

  getRole = async () => {
    const userRole = await StorageUtils.getValue(AppConstants.SP.ROLE);
    if (userRole) {
      this.setState({role: userRole});
    }
    this.setState({role: userRole});
  };

  onLogout = async () => {
    const {navigation} = this.props;
    this.setState({loading: true});

    var pushy_token = await StorageUtils.getValue('pushy_token');
    const formData = new FormData();
    // if (deviceToken)
    formData.append('deviceToken', pushy_token || 'no token');

    // const clearStorage = this.clearStorage;

    try {
      await axios
        .post(api.logout, formData)
        .then(async res => {
          if (res?.data?.statusCode === 200 && res?.data?.isValid) {
            EventRegister.emit('onAppLogout');
            Pushy.setBadge && Pushy.setBadge(0);
            BackgroundTimer.clearInterval();
            BackgroundTimer.stopBackgroundTimer();
            // StorageUtils.removeAll();
            await clearLocalProfile();

            this.setState({loading: false});
            const resetAction = StackActions.reset({
              index: 0,
              actions: [NavigationActions.navigate({routeName: 'Login'})],
            });
            this.props.navigation.dispatch(resetAction);
          }
          this.setState({loading: false});
          showMessage(res?.data?.message);
        })
        .catch(err => {
          this.setState({loading: false});
          Snackbar.show({
            text: err?.description
              ? err?.description
              : 'ConnectyCube chat disconnect is not working',
            duration: Snackbar.LENGTH_SHORT,
          });
        });
    } catch (err) {
      this.setState({loading: false});
      showMessage('Error', 'long');
    }

    // fetch(api.logout, {
    //   method: 'post',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'multipart/form-data',
    //     Authorization: 'Bearer ' + this.token,
    //   },
    //   body: formData,
    // })
    //   .then(response => response.json())
    //   .then(result => {
    //     this.setState({loading: false});
    //     if (result.statusCode === 200 && result.isValid) {
    //       Pushy.setBadge && Pushy.setBadge(0);
    //       BackgroundTimer.clearInterval();
    //       BackgroundTimer.stopBackgroundTimer();
    //       showMessage(result.message);
    //       // this.clearStorage();
    //       clearLocalProfile().then(r => {
    //         EventRegister.emit('onAppLogout');
    //         navigation.replace('Login');
    //       });
    //     } else {
    //       showMessage(result.message);
    //     }
    //   })
    //   .catch(err => {
    //     this.setState({loading: false});
    //   });
  };

  fetchCaregivers = async () => {
    const {user} = this.state;

    try {
      await axios
        .get(api.caregivers)
        .then(res => {
          if (res?.data != null) {
            this.setState({caregiverList: res?.data});
          }
          this.setState({loading: false});
        })
        .catch(err => {
          this.setState({loading: false});
          Snackbar.show({
            text: err?.description,
            duration: Snackbar.LENGTH_SHORT,
          });
        });
    } catch (err) {
      this.setState({loading: false});
      showMessage(`Error in fetching ${user[1].toLowerCase()}`);
    }

    // fetch(api.caregivers, {
    //   method: 'get',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //     Authorization: 'Bearer ' + this.token,
    //   },
    // })
    //   .then(response => {
    //     if (!response.ok) {
    //       showMessage(`Error in fetching ${user[1].toLowerCase()}`);
    //       return;
    //     }
    //     return response.json();
    //   })
    //   .then(data => {
    //     this.setState({caregiverList: data});
    //   })
    //   .catch(error => {
    //     showMessage(`Error in fetching ${user[1].toLowerCase()}`);
    //   });
  };

  onToggleChange = async index => {
    this.setState({selectedIndex: index});
    StorageUtils.storeInStorage(
      AppConstants.SP.DEFAULT_TEMP_UNIT,
      index == 0 ? 'F' : 'C',
    );
  };

  onToggleChangeBp = async index => {
    this.setState({selectedIndexBp: index});
    StorageUtils.storeInStorage(
      AppConstants.SP.DEFAULT_GLUCOSE_UNIT,
      index == 0 ? '1' : '2',
    );
  };

  renderSwitchTab = () => {
    const {selectedIndex} = this.state;
    return (
      <CustomSwitch
        tabItems={tabItems}
        selectedIndex={selectedIndex}
        width={60}
        onPressCallBack={this.onToggleChange}
      />
    );
  };

  renderSwitchTabBP = () => {
    const {selectedIndexBp} = this.state;
    return (
      <CustomSwitch
        tabItems={tabItemsBP}
        selectedIndex={selectedIndexBp}
        width={80}
        onPressCallBack={this.onToggleChangeBp}
      />
    );
  };

  renderCaregiverListItem = (item, index) => {
    const profileImg =
      item && item?.profileImage
        ? {uri: item?.profileImage}
        : images?.placeholder_user;

    return (
      <EListItem
        title={item?.firstName}
        key={index}
        leftAvatar={{
          source: profileImg,
          title: item?.firstName && item?.firstName.charAt(0),
        }}
        subtitle={item.priority === 1 ? 'Primary' : 'Secondary'}
        chevron
        rightElement={<Badge status={item?.isOnline ? 'success' : 'warning'} />}
        subtitleStyle={{color: 'grey', fontSize: 13}}
        onPress={() => {
          this.setState({dialog: false}),
            this.props.navigation.navigate('CaregiverDetailScreen', {
              profileData: item,
              id: item.careGiverId,
              name: item.firstName,
              fetchUsers: this.fetchCaregivers,
            });
        }}
      />
    );
  };

  render() {
    // console.log("at profile screen",this.profileData);
    const {
      loading,
      error,
      profileData,
      spinner,
      role,
      user,
      dialog,
      caregiverList,
      profileListData,
      isPrimary,
    } = this.state;
    const {navigation, apptype} = this.props;

    if (loading) return <Spinner visible={loading} />;

    if (error) {
      showMessage('Error in getting profile');
      return <NoDataState text="Error in getting profile" />;
    }

    let settingList = [];
    if (profileData) {
      settingList =
        profileData?.roleName === 'senior'
          ? profileListData
          : [
              {
                left: (
                  <Image source={images.user} style={{alignSelf: 'center'}} />
                ),
                title: 'Username',
                right: `${this.profileData?.firstName}`,
                onPress: () => this.navigateToEditProfile(),
              },
              {
                left: (
                  <Image source={icons.phone} style={{alignSelf: 'center'}} />
                ),
                title: 'Phone',
                right: `${this.profileData?.phone}`,
                onPress: () => this.navigateToEditProfile(),
              },
              {
                left: (
                  <Image
                    source={icons.password}
                    style={{alignSelf: 'center'}}
                  />
                ),
                title: 'Password',
                right: '12344566',
                onPress: () => {
                  navigation.navigate('UpdatePasswordScreen', {
                    email: this.profileData?.email || '',
                  });
                },
              },
              {
                title: 'Widgets Setting',
                onPress: () =>
                  navigation.navigate('WidgetsSettings', {
                    onReloadWidgetCallBack: () => this.checkVisibility(),
                    role: role,
                    apptype: apptype,
                  }),
                key: 'widgets_settings',
              },
              {
                title: 'Regional Settings',
                onPress: () =>
                  navigation.navigate('DeviceUnitsScreen', {
                    profileData: profileData,
                    role: {role},
                  }),
                key: 'device-units',
              },
            ];
    }

    return (
      <>
        <View style={styles.container}>
          {/* <TouchableOpacity 
             onPress={()=>navigation.goBack()}
            style={{marginTop:50,marginLeft:30}}>
               <Text> Back </Text>
               </TouchableOpacity> */}
          <Spinner visible={spinner} />
          <View style={styles.imageProfile}>
            <ImageProfile
              backgroundImage={
                profileData && profileData?.imagePath && role != 'senior'
                  ? {uri: profileData?.imagePath}
                  : images?.profile_bg
              }
              name={profileData?.firstName + ' ' + profileData?.lastName}
              address={this.profileData?.address}
              onLogout={() => navigation.navigate('HomeScreen')}
              role={role}
              avatar={profileData?.imagePath || false}
              email={profileData?.email}
            />
          </View>
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={this.getProfileData}
              />
            }>
            <PersonalDetail
              avatar={
                profileData && profileData.imagePath
                  ? {uri: profileData.imagePath}
                  : icons.tab_profile
              }
              isPrimary={isPrimary}
                showToPrimary={true}
                onViewProfile={()=>navigation.navigate('EditIndividualProfile',{
                  ...profileData,
                  role: role,
                  isPrimary: isPrimary,
                  individual:true,
                  seniorId: this.profileData.seniorId,
                  onRefreshCallBack: () => this.getProfileData(),
                  // careHomeLocation: profileData.careHomeOffice || 1,

                })
              }
              onPress={() =>
                navigation.navigate('EditIndividualProfile', {
                  ...profileData,
                  role: role,
                  isPrimary: isPrimary,
                  individual:false,
                  seniorId: this.profileData.seniorId,
                  onRefreshCallBack: () => this.getProfileData(),
                  // careHomeLocation: profileData.careHomeOffice || 1,
                })
              }
              title="Individual Profile"
              email={profileData?.email}
              description={profileData?.profileDescription}
            />

            <UserSettings settingList={settingList} showDivider={true} />
          </ScrollView>

          <RNDialog.Container visible={dialog}>
            {/* (this.state.appType === 1 || this.state.appType === '1') ? "Caregivers" : "Supervisors", */}
            {/* <RNDialog.Title>{`List of ${user[this.state.appType-1]}s`}</RNDialog.Title> */}
            <RNDialog.Title>{`List of ${
              this.state.appType === 1 || this.state.appType === '1'
                ? 'Caregiver'
                : 'Supervisor'
            }s`}</RNDialog.Title>
            <ScrollView>
              {caregiverList && caregiverList?.length > 0 ? (
                caregiverList.map((item, i) =>
                  this.renderCaregiverListItem(item, i),
                )
              ) : (
                <Text style={{alignSelf: 'center', margin: 12}}>{`No ${
                  user[1]
                }s Available!`}</Text>
              )}
            </ScrollView>
            <RNDialog.Button
              label={'Cancel'}
              onPress={() => this.setState({dialog: false})}
            />
          </RNDialog.Container>
        </View>
        {/* <TouchableOpacity
          style={styles.supportbutton}
          onPress={() => {
            navigation.navigate('TechSupport');
          }}>
          <View style={styles.imgContainer}>
            <Image style={styles.imgstyle} source={icons.helpiconfilled} />
          </View>
        </TouchableOpacity> */}
      </>
    );
  }
}
