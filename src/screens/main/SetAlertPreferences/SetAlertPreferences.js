import React, {Component} from 'react';
import {
  Text,
  Platform,
  View,
  TouchableOpacity,
  StatusBar,
  Slider,
  TextInput,
} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import {
  NavigationHeader,
  AlertHelper,
  DropDown,
  Row,
  Col,
} from '../../../components';
import {theme} from '../../../theme';
import {styles} from './styles';
import {heartRate} from './alertsJson';
import {api} from '../../../api';
import {fetchApiData} from '../../../apicall';
import {AppConstants, StorageUtils} from '../../../utils';
import Snackbar from 'react-native-snackbar';
import axios from 'axios';

const {
  container,
  subContainer,
  textStyle,
  headingStyle,
  descriptionStyle,
  redAlertStyle,
} = styles;

export default class SetAlertPreferences extends Component {
  constructor(props) {
    super(props);
    this.seniorId = props.navigation.getParam('seniorId', null);
    this.alertData = props.navigation.getParam('alertData', null);
    this.title = props.navigation.getParam('title', null);
    this.state = {
      error: null,
      minValue: 0,
      maxValue: 0,
      minSliderValue: 0,
      maxSliderValue: 0,
      redAlertSetting: 15,
      isFetchingData: false,
    };

    this.dropDownList = [
      {label: '0%', value: 0},
      {label: '5%', value: 5},
      {label: '10%', value: 10},
      {label: '15%', value: 15},
      {label: '20%', value: 20},
      {label: '25%', value: 25},
      {label: '30%', value: 30},
      {label: '35%', value: 35},
      {label: '40%', value: 40},
      {label: '45%', value: 45},
      {label: '50%', value: 50},
    ];
  }

  componentDidMount() {
    if (!this.seniorId) return;

    if (Platform.OS !== 'ios') {
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor(theme.colors.colorPrimary);
    }
    this.getActivityData();
  }

  // onClickDropDown = (item) => {
  //     this.setState({ redAlertSetting: item.value })
  // }

  getActivityData = async () => {
    // const id = navigation.getParam('id', '')
    const id = this.alertData.id;
    const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
    // const seniorId = await StorageUtils.getValue(AppConstants.SP.USER_ID)
    const activityNanme = this.alertData.activityName; // navigation.getParam('activityName', '')

    if (!!activityNanme) {
      this.setState({isFetchingData: true});
      const payload = {
        token: token,
        serviceUrl: `${api.setPatientActivity}/${
          this.seniorId
        }/${activityNanme}`,
        method: 'get',
      };

      const statsDataResult = await fetchApiData(payload);
      if (!statsDataResult) {
        this.setState({error: 'Unable to communicate with server!'});
        return;
      }
      const {startLimit, endLimit, redAlertSetting} = statsDataResult.data;

      //   const slider = heartRate[id];
      //   const activityMaxValue = slider[0].maxValue;
      if (activityNanme == 'Sleep') {
        this.setState({
          isFetchingData: false,
          minValue: startLimit / 60,
          maxValue: endLimit / 60,
          minSliderValue: startLimit / 60,
          maxSliderValue: endLimit / 60,
          redAlertSetting: redAlertSetting,
        });
      } else {
        this.setState({
          isFetchingData: false,
          minValue:
            this.alertData.title == 'Stress Level' ? endLimit : startLimit,
          maxValue:
            this.alertData.title == 'Stress Level' ? startLimit : endLimit,
          minSliderValue:
            this.alertData.title == 'Stress Level' ? endLimit : startLimit,
          maxSliderValue: endLimit,
          redAlertSetting: redAlertSetting,
        });
      }
    }
  };

  submitAlertData = async () => {
    const {navigation} = this.props;
    const {minValue, maxValue, redAlertSetting} = this.state;
    const title = navigation.getParam('title', '');
    const id = this.alertData.id; //navigation.getParam('id', '')
    const slider = heartRate[id];

    const apiPayload = {
      activityName: this.alertData.activityName, //navigation.getParam('activityName', ''),
      startLimit: id == 'stress_level' ? -1 : minValue,
      endLimit:
        id == 'stress_level'
          ? parseInt(minValue)
          : slider && slider.length > 1
          ? maxValue
          : 100000,
      createdDate: new Date(),
      redAlertSetting: redAlertSetting,
    };
    this.setState({isFetchingData: true});
    // const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);

    try {
      const uri = `${api.setPatientActivity}/${this.seniorId}`;

      await axios
        .put(uri, apiPayload)
        .then(res => {
          if (res?.data != null) {
            this.setState({isFetchingData: false});
            AlertHelper.show({
              description: ` ${title} alert settings has been saved`,
              cancelBtn: {negativeBtnLable: 'Ok'},
            });
          }
        })
        .catch(err => {
          this.setState({isFetchingData: false});
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });
    } catch (err) {
      this.setState({isFetchingData: false});
      AlertHelper.show({
        description: 'Network issue try again',
        cancelBtn: {negativeBtnLable: 'Ok'},
      });
    }
  };

  setSliderValue = (value, index, item) => {
    // const calValue = (value * item.maxValue).toFixed(item.isDecimalUnit ? 1 : 0)
    // console.log("----=> value: "+ value)

    const calValue =
      this.alertData.title == 'Stress Level'
        ? value
        : value.toFixed(item.isDecimalUnit ? 1 : 0);
    if (index == 0) {
      this.setState({minValue: calValue, minSliderValue: value});
    } else {
      this.setState({maxValue: calValue, maxSliderValue: value});
    }
  };

  setStepCount = minValue => {
    if (minValue <= 35000) this.setState({minValue});
    else
      Snackbar.show({
        text: 'Step counts limit is 35000',
        duration: Snackbar.LENGTH_LONG,
      });
  };

  render() {
    const {navigation} = this.props;
    const id = this.alertData.id; //navigation.getParam('id', '')
    const slider = heartRate[id];
    const {
      minValue,
      minSliderValue,
      maxSliderValue,
      isFetchingData,
      redAlertSetting,
    } = this.state;

    if (!this.seniorId)
      return <Text style={{padding: 50}}>No seniorId found</Text>;

    if (this.state.error)
      return <Text style={{padding: 50}}>{this.state.error}</Text>;

    // return <Text style={{padding:50,}}>Test</Text>

    return (
      <View style={container}>
        <NavigationHeader
          title={'Alert Settings'}
          leftText={'Back'}
          navigation={navigation}
        />
        {/* <Text>seniorId: {this.seniorId}</Text> */}
        <View style={subContainer}>
          <Spinner visible={isFetchingData} />
          <Text style={headingStyle}>{navigation.getParam('title', '')}</Text>
          {this.alertData.title != 'Step Count' ? (
            slider.map((item, index) => {
              const isStress =
                this.alertData.title == 'Stress Level' ? true : false;
              var readingVal;
              if (isStress) {
                readingVal = minSliderValue;
              } else {
                readingVal = index == 0 ? minSliderValue : maxSliderValue;
              }

              return (
                <View style={{marginHorizontal: 20}}>
                  <View style={{flexDirection: 'row', marginTop: 30}}>
                    <Text style={textStyle}>{item.title}</Text>
                    <Text
                      style={[
                        textStyle,
                        isStress
                          ? styles.AlertSettingTitleStyle
                          : {fontSize: 30, marginTop: -10},
                      ]}>
                      {isStress
                        ? readingVal == 0
                          ? 'Relaxed'
                          : readingVal == 1
                          ? 'Normal'
                          : readingVal == 2
                          ? 'Low Stress'
                          : readingVal == 3
                          ? 'Medium Stress'
                          : readingVal == 4
                          ? 'High Stress'
                          : readingVal == 5
                          ? 'Very High Stress'
                          : '' + '  '
                        : ` ${readingVal.toFixed(item.isDecimalUnit ? 1 : 0)}`}
                    </Text>
                    <Text
                      style={[textStyle, {fontSize: 14, marginTop: 6}]}>{` ${
                      item.unit
                    }`}</Text>
                  </View>
                  <Slider
                    step={item.sliderStep}
                    value={readingVal}
                    onValueChange={value =>
                      this.setSliderValue(value, index, item)
                    }
                    minimumValue={item.minValue}
                    maximumValue={item.maxValue}
                    minimumTrackTintColor={item.bgColor}
                    maximumTrackTintColor={item.bgColor}
                  />
                </View>
              );
            })
          ) : (
            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 16, fontWeight: 'bold'}}>
                Lower Boundary:{' '}
              </Text>
              <TextInput
                style={styles.textInputStyle}
                keyboardType="numeric"
                placeholder={'Step Count (steps)'}
                placeholderTextColor={theme.colors.grey_shade_1}
                onChangeText={minValue => {
                  this.setStepCount(minValue);
                }}
                value={`${minValue}`}
              />
            </View>
          )}
          {this.title != 'Falls' &&
            this.alertData.title != 'Fall Detection' && (
              <Text style={descriptionStyle}>
                {theme.strings.alertsDescription}
              </Text>
            )}
          <View
            style={{
              marginHorizontal: 20,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
              display: 'flex',
            }}>
            {this.title != 'Falls' && this.alertData.title != 'Fall Detection' && (
              <Row>
                <Col>
                  <Text style={redAlertStyle}>Red Alert Setting:</Text>
                </Col>
                <Col style={{paddingLeft: 10}}>
                  <DropDown
                    size="small"
                    data={this.dropDownList}
                    value={redAlertSetting}
                    onChange={(value, index, item) =>
                      this.setState({redAlertSetting: value})
                    }
                  />
                </Col>
              </Row>
            )}
          </View>

          <TouchableOpacity
            onPress={this.submitAlertData}
            activeOpacity={0.8}
            style={[
              theme.palette.nextButton,
              {
                width: 160,
                alignSelf: 'center',
                marginVertical: 20,
                position: 'relative',
                zIndex: 50,
              },
            ]}>
            <Text style={theme.palette.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
