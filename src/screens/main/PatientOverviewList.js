import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {theme} from '../../theme';
import {
  HeaderButton,
  Row,
  Col,
  NavigationHeaderV2,
  Contact,
} from '../../components';
import {GET_PATIENT_OVERVIEW} from '../../api';
import {AppConstants, StorageUtils, getAppUsers, Utils} from '../../utils';
import {sendRequest} from '../../apicall';
import _ from 'lodash';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {getLocalProfile} from '../../utils/fetcher';
import fonts from '../../theme/fonts';
import colors from '../../theme/colors';

const activityDisplayArray = [
  {key: 'ActivityScore', title: 'Activity Score'},
  {key: 'RiskScore', title: 'Risk Score'},
  {key: 'Falls', title: 'Falls'},
  {key: 'HeartRate', title: 'Heart Rate'},
  {key: 'HRV', title: 'HRV'},
  {key: 'BPSystolic', title: 'Blood Pressure Systolic'},
  {key: 'BPDiastolic', title: 'Blood Pressure Diastolic'},
  {key: 'BloodGlucose', title: 'Blood Glucose'},
  {key: 'SpO2', title: 'Oxygen Saturation'},
  {key: 'Sleep', title: 'Sleep'},
  {key: 'BodyTemprature', title: 'Body Temp'},
  {key: 'StepCount', title: 'Step Count'},
  {key: 'BMIWeight', title: 'Weight'},
  {key: 'StressLevel', title: 'Stress Level'},
  {key: 'RespiratoryRate', title: 'Respiratory Rate'},
];

const showvalue = (val, title) => {
  if (title == 'Sleep') {
    let timeObj =
      val > 59 ? Utils.minToHours(val, true) : {minutes: val, hours: 0};

    let hrs = null;
    if (timeObj.hours > 0) hrs = timeObj.hours;
    let min = null;
    if (timeObj.hours > 0 || timeObj.minutes > 0) min = timeObj.minutes || '0';
    if (min > 0) {
      return hrs + '-' + min;
    } else {
      return hrs;
    }
  } else if (title == 'BMIWeight') {
    return Math.round(val / 0.45359237);
  } else if (title == 'BloodGlucose') {
    return val * 18;
  } else if (title == 'StressLevel') {
    let convertedValus =
      val == -1
        ? 'R'
        : val == 0
        ? 'N'
        : val == 1
        ? 'L'
        : val == 2
        ? 'M'
        : val == 3
        ? 'H'
        : val == 4
        ? 'V'
        : '';
    return convertedValus;
  } else {
    return Math.round(val);
  }
};
const ListItem = ({data}) => {
  const [showActivity, setShowActivity] = React.useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowActivity(!showActivity)}
        activeOpacity={0.5}>
        <Contact
          titleStyle={{fontWeight: '100'}}
          desc={data.isOnline ? 'online' : 'Offline'}
          givenName={`${data.firstName} ${data.lastName}`}
          thumbnailPath={{uri: data.profileImage}}
        />
      </TouchableOpacity>

      {showActivity && data.activity && data.activity.length > 0 && (
        <View style={{marginLeft: 60, marginTop: 5}}>
          {activityDisplayArray.map((row, i) => {
            let itm = data.activity.find(o => o.title == row.key);
            if (!itm) return null;
            let clr;
            if (itm.title === 'Falls') {
              clr = itm.value > 0 ? colors.red_shade_1 : colors.green_color;
            } else {
              clr = itm.colorCode;
            }
            return (
              <Row key={i} style={{marginBottom: 5}}>
                <Col valign="center">
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: clr,
                      borderRadius: 20,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.valueStyle} numberOfLines={1}>
                      {itm.value == -1 && itm.title != 'StressLevel'
                        ? 0
                        : showvalue(itm.value, itm.title)}
                    </Text>
                  </View>
                </Col>
                <Col valign="center" style={{paddingHorizontal: 10}}>
                  <Text>---</Text>
                </Col>
                <Col valign="center" flex="auto">
                  <Text style={{fontSize: 14}}>{row.title}</Text>
                </Col>
              </Row>
            );
          })}
          {/* {data.activity}
            itm.title==''
                <Row key={i} style={{ marginBottom: 5 }}>
                    <Col valign="center"><View style={{ width: 30, height: 30, backgroundColor: itm.colorCode, borderRadius: 50 }} /></Col>
                    <Col valign="center" style={{ paddingHorizontal: 10 }}><Text>---</Text></Col>
                    <Col valign="center" flex="auto"><Text style={{ fontSize: 14 }}>{itm.title}</Text></Col>
                </Row> */}
          {/* {data.activity.map((itm, i) => {
                    return (<Row key={i} style={{marginBottom:5}}>
                        <Col valign="center"><View style={{ width: 30, height: 30, backgroundColor: itm.colorCode, borderRadius:50}} /></Col>
                        <Col valign="center" style={{paddingHorizontal:10}}><Text>---</Text></Col>
                        <Col valign="center" flex="auto"><Text style={{fontSize:14}}>{itm.title}</Text></Col>
                    </Row>)
                })} */}
        </View>
      )}
    </>
  );
};

export class PatientOverviewList extends Component {
  state = {userList: null, busy: true, fatalError: null};
  role = null;

  async componentDidMount() {
    const userId = await StorageUtils.getValue(AppConstants.SP.USER_ID);
    this.role = StorageUtils.getValue(AppConstants.SP.ROLE);

    // const localProfile = await getLocalProfile();
    let uri = GET_PATIENT_OVERVIEW(userId);

    sendRequest({uri, method: 'get'}).then(results => {
      if (results && results.errors) {
        let errString = '';
        for (let a in results.errors)
          errString += `${a} = ${results.errors[a]}, `;

        this.setState({fatalError: errString, busy: false});
      }
      if (!results || !_.isArray(results)) {
        return;
      }
      this.setState({userList: results, busy: false});
    });
  }

  render() {
    const {busy, userList, fatalError} = this.state;
    const {navigation} = this.props;

    return (
      <View style={styles.root}>
        <Spinner visible={busy} />

        <NavigationHeaderV2
          title="Patient Overview"
          allowBack
          navigation={this.props.navigation}
          rightComponent={<View style={{width: 50}} />}
        />

        <View style={styles.container}>
          <KeyboardAwareScrollView
            contentContainerStyle={{flexGrow: 1}}
            enableOnAndroid={true}>
            {this.state.fatalError && (
              <Text style={{padding: 10, fontSize: 16, color: '#F00'}}>
                {this.state.fatalError}
              </Text>
            )}

            {userList && userList.length < 1 && (
              <Text
                style={{
                  fontSize: 18,
                  padding: 10,
                  color: '#CCC',
                  textAlign: 'center',
                }}>
                Individual Diary is empty
              </Text>
            )}

            {userList &&
              userList.map((item, i) => {
                return (
                  <Row key={i} style={{flexWrap: 'nowrap'}}>
                    <Col flex="auto">
                      <ListItem data={item} key={i} />
                    </Col>
                    {/* <Col valign="center" style={{ paddingHorizontal: 0 }}>
                                    <TouchableOpacity onPress={console.log} activeOpacity={0.5} style={styles.menubutton}>
                                        <Icon name="phone" size={20} color="#CCC" />
                                    </TouchableOpacity>
                                </Col> */}
                    <Col style={{paddingHorizontal: 10, paddingVertical: 25}}>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('SeniorHome', {
                            profileData: {...item},
                            seniorId: item.seniorId,
                            seniorName: item.firstName + ' ' + item.lastName,
                            seniorImg: item.profileImage,
                            seniorGeofence: item.geofenceLimit,
                            seniorPhone: item.phone,
                            // noGoAreas: item.noGoAreas,
                            role: this.role,
                            // refreshSeniorsData: refreshSeniors
                          });
                        }}
                        activeOpacity={0.5}
                        style={styles.menubutton}>
                        <Icon name="ellipsis-v" size={20} color="#CCC" />
                      </TouchableOpacity>
                    </Col>
                  </Row>
                );
              })}
          </KeyboardAwareScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  menubutton: {
    borderWidth: 1,
    borderRadius: 50,
    borderColor: '#EEE',
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  root: {
    flex: 1,
    backgroundColor: theme.colors.colorPrimary,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  valueStyle: {
    fontSize: 14,
    fontFamily: fonts.SFProMedium,
    color: colors.white,
  },
});
