import {Image, Linking, Text, TouchableOpacity, View} from 'react-native';
import {icons, images} from '../../assets';
import {getTOffset} from '../../utils/Utils';
import {RoundButton} from '../RoundButton';
import React from 'react';
import {styles} from './styles';
import {theme} from '../../theme';
import {Row, Col} from '../Grid';
export const AlertUnreadNotification = props => {
  const {
    alertTitle,
    description,
    time,
    taskPriority,
    role,
    id,
    acknowledgeAlert,
    type,
    taskDescription,
  } = props;

  const acknowledgeAlertCallBack = () => {
    acknowledgeAlert(id);
  };
  const alertTime = getTOffset(time);
  return (
    <View style={styles.card}>
      <View
        style={[
          styles.upperBackground,
          {
            backgroundColor:
              taskPriority == 3 && type == 9
                ? '#67E29B' //green
                : taskPriority == 2 && type == 9
                ? '#F5B47B' //orange
                : taskPriority == 1
                ? '#FB9191' //red
                : '#D2D4D3', //grey
          },
        ]}>
        {/* <Text>{id}</Text> */}
        <View style={{flex: 1}}>
          <Text style={styles.heading} numberOfLines={2}>
            {alertTitle}
          </Text>
          <Text style={styles.text}>{`${description}`}</Text>
          <Text style={styles.desTextStyle} numberOfLines={3}>
            {taskDescription}
          </Text>
        </View>

        <Row style={styles.row2}>
          <Col flex="auto">
            <Text>{alertTime.offsetTime.format('h:mm a, Do MMM, YYYY')}</Text>
          </Col>
          <Col>
            <Text style={styles.text2}>
              {getTOffset(time).offsetTime.fromNow()}
            </Text>
          </Col>
        </Row>
      </View>

      <Row style={styles.row2}>
        <Col valign="center">
          <RoundButton
            title={'CANCEL'}
            callBackFunction={() => {}}
            bgColor={theme.colors.grey_shade_1}
          />
        </Col>
        <Col flex="auto" valign="center" align="center">
          <RoundButton
            title={'ACKNOWLEDGED'}
            callBackFunction={acknowledgeAlertCallBack}
            bgColor={theme.colors.colorPrimary}
          />
        </Col>
        <Col valign="center">
          <TouchableOpacity
            style={{marginLeft: 10, height: 22, width: 22}}
            onPress={() => props.addToTask(id, alertTitle, description)}>
            <Image
              source={icons.add_icon}
              style={{height: '100%', width: '100%'}}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Col>
      </Row>
    </View>
  );
};
