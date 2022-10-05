import {Avatar, Button, ListItem, withBadge} from 'react-native-elements';
import {FlatList, Image, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useState} from 'react';

import {AddUser} from '../AddUser/AddUser';
import {SeniorDetail} from '../SeniorDetail';
import Snackbar from 'react-native-snackbar';
import {api} from '../../api';
import {getAppUsers} from '../../utils';
import {theme} from '../../theme';
import {useFetch} from '../../hooks';
import {TouchableOpacity} from 'react-native-gesture-handler';
import colors from '../../theme/colors';
import {icons} from '../../assets';
import {EventRegister} from 'react-native-event-listeners';

export const UsersList = ({
  navigate,
  type,
  size,
  refreshSOS,
  isShowTasks,
  isShowStatics,
  role,
  props,
}) => {
  const {loading, error, data, fetchData} = useFetch(
    type === 'senior' ? api.seniors : api.caregivers,
  );
  const [refresh, setRefresh] = useState(false);
  const [user, setUser] = useState(['', '']);
    // console.log("USers data is here",data)


  useEffect(() => {
    getAppUsers(u => {
      setUser(u);
    });
    const unsubscribe = props?.addListener('didFocus', () => {
      fetchData();
    });

    return () => unsubscribe;
  }, [refresh, props]);

  useEffect(() => {
    const listener = EventRegister.addEventListener('myCustomEvent', data => {
      // Notification with AlertTypeId==12 is created when a add senior or caregiver in list
      // Notification with AlertTypeId==7 is created when remove senior from list
      // Notification with AlertTypeId==8 is created when remove caregiver from list
      if ([7, 8, 12].includes(+data?.AlertTypeId)) {
        fetchData();
      }
    });
    return () => {
      EventRegister.removeEventListener(listener);
    };
  }, []);
  const onPress = item => () => {
    // console.log("item data",item)
    navigate('SeniorHome', {
      profileData: item,
      seniorId: item.seniorId,
      // seniorName:"this is checking",
      seniorName: item.firstName + ' ' + item.lastName,
      seniorImg: item.profileImage,
      seniorGeofence: item.geofenceLimit,
      seniorPhone: item.phone,
      noGoAreas: item.noGoAreas,
      role: role,
      refreshSeniorsData: refreshSeniors,
    });
  };

  const refreshSeniors = () => {
    fetchData().then(() => setRefresh(false));
  };

  if (error) {
    Snackbar.show({
      title: 'Error in fetching ' + type,
      duration: Snackbar.LENGTH_SHORT,
    });
  }

  if (data && data.length === 1) {
    onPress(data[0]);
  }

  if (refresh) {
    fetchData().then(() => setRefresh(false));
  }

  const renderItem = ({item, index}) => {
    // console.log("item data",item)
    const profileImage = item.profileImage
      ? {uri: item.profileImage}
      : icons.placeholder_user;
    const BadgedAvatar = withBadge(item.isOnline, {
      value: type === 'senior' ? ' ' : item.priority === 1 ? 'P' : 'S',
    
      textStyle: {fontSize: 15, fontWeight: '500'},
      status: item.isOnline ? 'success' : 'error',
      badgeStyle: {top: item.isOnline ? 3 : 0, right: item.isOnline ? 15 : 0},
    })(Avatar);

    return (
      <>
      {/* {console.log("type",type)} */}
        {type === 'senior' ? (

          // <></>
          <SeniorDetail
            individual={item}
            fetchSenior={fetchData}
            onPress={onPress(item)}
          />
        ) : (
          <View style={{maxWidth: 100}}>
            <View style={{marginHorizontal: 12}}>
              <BadgedAvatar
                title={
                  item.firstName &&
                  item.firstName.charAt(0) + item.lastName &&
                  item.lastName.charAt(0)
                }
                source={profileImage}
                rounded
                size={size === 'small' ? 50 : 60}
                activeOpacity={0.7}
                Press={() =>
                  // alert("clicked")
                  
                  navigate('CaregiverDetailScreen', {
                    profileData: item,
                    id: item.careGiverId,
                    name: item.firstName,
                    fetchUsers: fetchData,
                    refreshSOS,
                    isShowTasks,
                    isShowStatics,
                  })
                  
                }
              />
            </View>
            <Text
              style={{
                alignSelf: 'center',
                fontSize: size === 'small' ? 13 : 15,
                maxWidth: 80,
              }}>
              {item.firstName}
            </Text>
          </View>
        )}
        {data.length - 1 === index ? (
          <AddUser type={type} refetch={fetchData} user={user} />
        ) : null}
      </>
    );
  };
  return (
    <>
      <ListItem
        title={`Registered  ${
          type === 'senior' ? user[0] + 's' : user[1] + 's'
        }`}
        titleStyle={styles.title}
        rightElement={
          <Button
            type="clear"
            icon={{
              name: 'refresh',
              onPress: () => fetchData(),
              color: theme.colors.colorPrimary,
              size: 25,
            }}
            loading={loading}
          />
        }
        containerStyle={styles.titleContianer}
      />

      <View style={styles.userListContainer}>
        <View style={{width: '90%'}}>
          {data && data.length > 0 ? (
            // <></>
            <FlatList
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              data={data}
              renderItem={renderItem}
              style={{flexGrow: 0}}
              contentContainerStyle={styles.flatListContent}
            />
          ) : (
            // <></>
            <AddUser type={type} refetch={fetchData} user={user} />
          )}
        </View>
        {/* techSupport Absolute Button */}
        <TouchableOpacity
          style={styles.supportbutton}
          onPress={() => {
            props.navigate('TechSupport');
          }}>
          <View style={styles.imgContainer}>
            <Image
              style={styles.imgstyle}
              source={require('../../assets/icons/helpIcon.png')}
            />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {fontSize: 22, fontFamily: theme.fonts.SFProBold},
  titleContianer: {paddingTop: 4, paddingBottom: 8},
  flatListContent: {marginLeft: 8, marginRight: 8},
  userListContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  supportbutton: {
    flex: 1,
    backgroundColor: colors.colorPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  imgContainer: {
    width: 15,
    height: 13,
  },
  imgstyle: {
    height: '100%',
    width: '100%',
    tintColor: theme.colors.white,
  },
});
