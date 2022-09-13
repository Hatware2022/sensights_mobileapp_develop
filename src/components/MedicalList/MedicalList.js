import {Image, Text, TouchableOpacity, View, ScrollView} from 'react-native';
import React, {useState} from 'react';
import {icons, images} from '../../assets';
import {Row, Col} from '../Grid';
import RNDialog from 'react-native-dialog';
import {styles} from './styles';
import {getTOffset} from '../../utils/Utils';
import moment from 'moment';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign'
export const MedicalListItem = props => {
  const [visible, setVisible] = useState(false);
  const priorityArray = [
    {label: 'Low', value: '1'},
    {label: 'Medium', value: '2'},
    {label: 'High', value: '3'},
  ];

  const {
    id,
    message,
    description,
    time,
    checked,
    priority,
    title,
    assignedToName,
    createdByName,
    taskDueDate,
    taskPriority,
  } = props;
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const date = new Date(time);
  let dueDate = moment(taskDueDate);
  let createDate = moment(time);
  const _displayDate = dueDate.format('MM/DD/YYYY');
  const createdDate = createDate.format('MM/DD/YYYY');

  const getPriority = val => {
    switch (val) {
      case 3:
        return 'Low';
      case 2:
        return 'Medium';
      case 1:
        return 'High';
      default:
        return 'N/A';
    }
  };

  const __time = getTOffset(time);

  let __date = __time.offsetTime.format('dddd, HH:mm');

  // __date = `${days[date.getDay()]}, `;
  // __date += `${date.getHours() > 9 ? date.getHours() : "0" + date.getHours()}:`;
  // if (date.getMinutes()>9) __date += `${date.getMinutes()}`
  // else __date += `0${date.getMinutes()}`

  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Row>
        <Col valign="center">
          <TouchableOpacity
            onPress={() => props.showTaskCompleteDialog(id)}
            style={{padding: 10, paddingRight: 15}}>
            <Image source={checked ? icons.checked_icon : icons.unchecked} />
          </TouchableOpacity>
        </Col>

        <Col flex="auto" valign="center">
          <TouchableOpacity
            onPress={() => setVisible(true)}
            style={{width: '100%'}}>
            <View style={styles.contentRoot}>
              {/* {message ? <Text style={styles.taskName}>{message}</Text> : null} */}
              {(title || description) && (
                <Text
                  style={{fontWeight: 'bold', width: '90%'}}
                  numberOfLines={1}
                  ellipsizeMode={'tail'}>
                  {title || description}
                </Text>
              )}
              <Row>
                <Col flex="auto" valign="center">
                  <Text>Message</Text>
                </Col>
                <Col valign="center">
                  <Text
                    style={{
                      color: 'grey',
                      fontWeight: 'bold',
                      marginRight: 16,
                    }}>
                    {message}
                  </Text>
                </Col>
              </Row>
              <Row>
                <Col flex="auto" valign="center">
                  <Text>{__date}</Text>
                </Col>
                {/* <Col valign="center"> */}
                  {/* <Text style={{color: 'grey', marginRight: 16}}>
                    Importance Level:{' '}
                    <Text style={{fontWeight: 'bold'}}>
                      {getPriority(priority)}
                    </Text>
                  </Text> */}
                {/* </Col> */}
              </Row>
              {createdDate && (
                <>
                <View style={{flexDirection:'row',marginRight:'7%',}}>
                <Text
                  style={{width: '90%', marginTop: 5}}
                  numberOfLines={1}
                  ellipsizeMode={'tail'}>
                  {createdDate}
                </Text>
                <View style={{flexDirection:'row',marginTop:-12}}>
                  <Feather name='edit' size={18} onPress={props.onPressEdit} />
                  <AntDesign name='delete' size={18} style={{paddingHorizontal:7}} onPress={props.onPressDelete}/>
                </View>
                </View>
                </>
              )}
              {/* {props.overdue && (
                <View style={styles.overdueContainer}>
                  <Text style={styles.overdueText}>Overdue</Text>
                  <Image source={icons.overdue_alert} />
                </View>
              )} */}
            </View>
          </TouchableOpacity>
        </Col>
      </Row>
      {/* <View style={{backgroundColor: 'red'}}>
        <RNDialog.Container
          contentStyle={{height: '70%'}}
          visible={visible}
          key={id}>
          <ScrollView style={{padding: 10}}>
            <RNDialog.Title
              style={{
                fontSize: 14,
                alignSelf: 'flex-start',
              }}>{`Task:  ${description}`}</RNDialog.Title>
          </ScrollView>
          <RNDialog.Description
            style={{
              fontSize: 14,
              alignSelf: 'flex-start',
            }}>{`Created by:  ${createdByName}`}</RNDialog.Description>
          <RNDialog.Description
            style={{
              fontSize: 14,
              alignSelf: 'flex-start',
            }}>{`Assign To:  ${assignedToName}`}</RNDialog.Description>
          <RNDialog.Description
            style={{
              fontSize: 14,
              alignSelf: 'flex-start',
            }}>{`Due on:  ${_displayDate}`}</RNDialog.Description>
          <RNDialog.Description
            style={{
              fontSize: 14,
              alignSelf: 'flex-start',
              paddingBottom: 0,
            }}>{`Priority:  ${getPriority(priority)}`}</RNDialog.Description>

          <RNDialog.Button
            label="Cancel"
            onPress={() => setVisible(false)}
            bold
          />
        </RNDialog.Container>
      </View> */}
    </View>
  );
};
