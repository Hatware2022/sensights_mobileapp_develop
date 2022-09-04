import {
  FlatList,
  Platform,
  Text,
  View,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import React, {Component} from 'react';
import get from 'lodash/get';
import {NavigationHeader, ServiceItem} from '../../../components';
import {images, icons} from '../../../assets';
import {styles} from './styles';
import {commonStyles} from '../../../commonStyles';
import PropTypes from 'prop-types';
import axios from 'axios';
// import SocketManager from '../Streamer/socketManager'
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import RNVeyetalsNative from 'react-native-veyetals-native-j8';
import {AppConstants, StorageUtils} from '../../../utils';
import {
  DisclaimerVeyetal,
  refDisclaimerVeyetal,
} from '../../../components/DisclaimerVeyetal';
import {api} from '../../../api';
import Snackbar from 'react-native-snackbar';
// import Logger from '../Streamer/utils/logger';
// import { checkPermissions, grantAllPermissions } from '../../../utils/permissionHandler';

const {container, heading, subContainer} = styles;
const arrayHolder = [{name: 'Veyetals', image: icons.veyetals}];

export default class Apps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allDevices: arrayHolder,
      userName: '',
      listLiveStream: [],
      seniorId: props.navigation.getParam('seniorId', null),
      showDisclaimer: false,
    };

    this.state.userName = this.state.seniorId;

    //this.manager = new BleManager();
  }

  componentDidMount() {
    // SocketManager.instance.emitListLiveStream();
    // SocketManager.instance.listenListLiveStream((data) => {
    //   this.setState({ listLiveStream: data });
    // });
    // this.getPermissions()
  }

  // async getPermissions(){
  //   const granted = await grantAllPermissions();
  //   if (!granted){
  //     Alert.alert(
  //       "Permissions denied",
  //       "You need to grant required permissions to use this app properly!",
  //       [{ text: "Ok", onPress: () => console.log("OK") }],
  //       { cancelable: false }
  //     );

  //     return this.getPermissions();
  //   }

  //   return granted;
  // }

  showAgreementPopUp = () => {
    this.setState({showDisclaimer: true});
  };

  startNativeVeyetals = async () => {
    try {
      const email = await StorageUtils.getValue(AppConstants.SP.EMAIL);
      const vitals = await RNVeyetalsNative.start(
        email,
        'MARKITECH',
        'face',
        false,
      );
      if (vitals !== undefined) {
        // console.log("Vitals stats:" ,vitals)
        // console.log( vitals["Heart-rate"]);
        // console.log( vitals["HRV"]);
        // console.log( vitals["02-saturation"]);
        // console.log( vitals["Respiration-rate"]);
        // console.log( vitals["Stress-levels"]);
        this.setState(
          {
            ...this.state,
            heartRate: vitals['Heart-rate'] || '',
            hrv: vitals['HRV'] || '',
            oxygenLevel: vitals['02-saturation'] || '',
            respiratoryRate: vitals['Respiration-rate'] || '',
            stressLevel: vitals['Stress-levels'] || '',
            // bp : vitals["Heart-rate"] || '',
            diastolic: vitals['Diastolic'] || '',
            systolic: vitals['Systolic'] || '',
          },
          () => {
            this.onSavePress();
          },
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  async onSavePress() {
    this.setState({savingData: true});

    const apiPayload = {
      deviceTag: 'Veyetals',
      heartRate: this.state.heartRate,
      hrv: this.state.hrv,
      oxygenLevel: this.state.oxygenLevel,
      respiratoryRate: this.state.respiratoryRate,
      stressLevel: this.state.stressLevel,
      diastolic: this.state.diastolic,
      systolic: this.state.systolic,
      // bp : this.state.bp,
    };

    let id = await StorageUtils.getValue(AppConstants.SP.USER_ID);
    const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);

    this.saveFdaDeviceData(apiPayload, api.addBMIScale).then(r => {
      this.setState({
        savingData: false,
        countHeart: 0,
        progress: 0,
        heartRate: '',
        hrv: '',
        respRate: '',
        oxygen: '',
        stress: '',
        // bp: "",
        data: '',
        systolic: '',
        diastolic: '',
      });
      this.goBackToProfileScreen();
    });
  }

  saveFdaDeviceData = async (payloadData, serviceUrl) => {
    //  console.log("saveFdaDeviceData(): ", payloadData);

    const reqBody = payloadData;
    //console.log(reqBody);
    // const token = await this.getToken();
    this.setState({isFetchingData: true});

    try {
      await axios
        .post(serviceUrl, reqBody)
        .then(res => {
          //   console.log("responseOnSave", res);
          // alert("saveFdaDeviceData: sucess: ", JSON.stringify(res))
          if (res?.data != null) {
            Snackbar.show({
              text: 'Data has been saved successfully',
              duration: Snackbar.LENGTH_LONG,
            });
          }
          this.setState({isFetchingData: false});
        })
        .catch(err => {
          this.setState({isFetchingData: false});
          // alert("saveFdaDeviceData: error: ", JSON.stringify(err))
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });
    } catch (err) {
      this.setState({isFetchingData: false});
      alert('saveFdaDeviceData: inside catch: ', JSON.stringify(err));
      Snackbar.show({
        text: 'Network issue try again later ',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  onPressLiveStreamNow = async () => {
    this.showAgreementPopUp();
  };

  renderListItem = item => {
    return (
      <ServiceItem
        deviceName={item.name}
        image={item.image}
        item={item}
        onItemPressCallBack={this.onPressLiveStreamNow}
      />
    );
  };

  goBackToProfileScreen = () => {
    const {navigation} = this.props;

    navigation.navigate('HomeScreen');
  };
  /*
  onPressCardItem = (data) => {
    const { route } = this.props;
    const userName = 'roshaan';
    const {
      navigation: { navigate },
    } = this.props;
    navigate('Viewer', { userName, data });
  };
  onWebPress = (data) => {
    const { route } = this.props;
    const userName = 'roshaan';
    const {
      navigation: { navigate },
    } = this.props;
    navigate('webRtc');

  }

  */

  render() {
    const {navigation, route} = this.props;
    const {allDevices, listLiveStream, userName} = this.state;
    // const userName = this.state.userName;

    return (
      <View style={commonStyles.full_page_container}>
        <NavigationHeader
          title={'Apps'}
          leftText={'Back'}
          navigation={navigation}
        />

        <View style={subContainer}>
          <Text style={heading}>Connected Apps</Text>
          <FlatList
            data={allDevices}
            renderItem={({item}) => this.renderListItem(item)}
            keyExtractor={(item, index) => index.toString()}
          />
        </View>
        <DisclaimerVeyetal
          showModal={this.state.showDisclaimer}
          onClose={() => {
            this.setState({showDisclaimer: false});
          }}
          onNext={() => {
            this.setState({showDisclaimer: false});
            if (Platform.OS === 'ios') {
              const {
                navigation: {navigate},
              } = this.props;
              const {userName} = this.state;
              navigate('Streamer', {userName, roomName: userName});
            } else {
              this.startNativeVeyetals();
            }
          }}
        />
      </View>
    );
  }
}

Apps.propTypes = {
  route: PropTypes.shape({}),
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
  }).isRequired,
};

Apps.defaultProps = {
  route: null,
};
