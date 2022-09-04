import React from 'react';
import {
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import styles from './styles';
import Animatable from 'react-native-reanimated';
import colors from '../../../theme/colors';
import {icons} from '../../../assets';
import {NavigationHeader} from '../../../components';
import Spinner from 'react-native-loading-spinner-overlay';
import {api} from '../../../api';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';
import {getTOffset} from '../../../utils';
import {theme} from '../../../theme';
import {EventRegister} from 'react-native-event-listeners';
export class ScheduleCall extends React.Component {
  state = {
    activeSections: [0],
    isloading: false,
    PendingVisits: [],
    ConfirmVisits: [],
    RejectedVisits: [],
    CompletedVisits: [],
  };
  showError = err => {
    setTimeout(() => {
      Snackbar.show({
        text: err ? err : 'Error in fetching data ',
        duration: Snackbar.LENGTH_SHORT,
      });
    }, 100);
  };
  promisesAllsettled = async () => {
    const uri = String(api.getAllMeetingRoomSchedule).replace('{id}', 1);
    const confirmuri = String(api.getAllMeetingRoomSchedule).replace('{id}', 2);
    const declineuri = String(api.getAllMeetingRoomSchedule).replace('{id}', 3);
    const completeduri = String(api.getAllMeetingRoomSchedule).replace(
      '{id}',
      4,
    );
    this.setState({isloading: true});
    try {
      await Promise.all([
        axios
          .get(uri)
          .then(res => {
            if (res?.data != null && res?.data?.length > 0) {
              this.setState({PendingVisits: res?.data});
            }
          })
          .catch(err => {
            console.log(err);
            throw 'Error in Fetching Pending Calls list';
            // this.showError(err);
          }),
        axios
          .get(confirmuri)
          .then(res => {
            if (res?.data != null && res?.data?.length > 0) {
              this.setState({ConfirmVisits: res?.data});
            }
          })
          .catch(err => {
            throw 'Error in Fetching Confirm Calls list';
            //this.showError(err);
          }),
        axios
          .get(declineuri)
          .then(res => {
            if (res?.data != null && res?.data?.length > 0) {
              this.setState({RejectedVisits: res?.data});
            }
          })
          .catch(err => {
            throw 'Error in Fetching Rejected Calls list';
            // this.showError(err);
          }),
        ,
        axios
          .get(completeduri)
          .then(res => {
            if (res?.data != null && res?.data?.length > 0) {
              this.setState({CompletedVisits: res?.data});
            }
          })
          .catch(err => {
            throw 'Error in Fetching Completed Calls list';
            //   this.showError(err);
          }),
        ,
      ]).then(results => {
        this.setState({isloading: false});
        // results.forEach(result => console.log(result));
      });
    } catch (error) {
      this.setState({isloading: false});
      this.showError(error);
    }
  };

  componentDidMount = () => {
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.promisesAllsettled();
    });
    this.listener = EventRegister.addEventListener('myCustomEvent', data => {
      //  if ([15, 14,22, 26, 17, 24].includes(+data?.AlertTypeId)) {
      this.promisesAllsettled();
      //   }
    });
  };
  componentWillUnmount = () => {
    this.focusListener.remove();
    EventRegister.removeEventListener(this.listener);
  };

  getTimeOffset = date => {
    const {offset, offsetTime} = getTOffset(date);
    return offsetTime.format('dddd, Do MMM yyyy , h:mm a');
  };
  ItemViewer = item => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => {
          let activeSection;

          if (this.state.activeSections == 0) {
            activeSection = 'scheduledSection';
          } else if (this.state.activeSections == 1) {
            activeSection = 'pendingSection';
          } else if (this.state.activeSections == 2) {
            activeSection = 'rejectedSection';
          } else if (this.state.activeSections == 3) {
            activeSection = 'completedSection';
          } else {
            activeSection = '';
          }

          this.props.navigation.navigate('ScheduleCallDetails', {
            navigation: this.props.navigation,
            item: this.state.IsseniorUser ? item.meetingRoom : item,
            activeSection: activeSection,
          });
        }}>
        <Text style={styles.visitDetailStyle} numberOfLines={1}>
          {item.visitDetail}
        </Text>
        <Text style={styles.meetingDateStyle}>
          {this.getTimeOffset(item.meetingDateTime)}
        </Text>
        <Text style={styles.meetingDateStyle}>
          {item.meetingDuration} mins
          {item.meetingCalltype == 1 ? '  Video' : '  Audio'}
        </Text>
      </TouchableOpacity>
    );
  };
  ListViewer = list => {
    return list.length > 0 ? (
      <View style={{height: 250, backgroundColor: '#CDCECD'}}>
        <FlatList
          data={list}
          contentContainerStyle={{paddingVertical: 15}}
          renderItem={({item}) => {
            return this.ItemViewer(item);
          }}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    ) : (
      <View style={{backgroundColor: '#CDCECD'}}>
        <Text style={styles.emptyListText}>List is Empty</Text>
      </View>
    );
  };
  sections = () => {
    return [
      {
        title: 'Scheduled Calls',
        content: this.ListViewer(this.state.ConfirmVisits),
      },
      {
        title: 'Pending Calls',
        content: this.ListViewer(this.state.PendingVisits),
      },

      {
        title: 'Rejected Calls',
        content: this.ListViewer(this.state.RejectedVisits),
      },
      {
        title: 'Completed Calls',
        content: this.ListViewer(this.state.CompletedVisits),
      },
    ];
  };

  _navigationHandler = () => {
    this.props.navigation.navigate('SelectProvideScreen');
  };
  _renderHeader(section, index, isActive, sections) {
    return (
      <Animatable.View
        duration={300}
        transition="backgroundColor"
        style={
          isActive
            ? styles.ActiveHeaderContainer
            : styles.InActiveHeaderContainer
        }>
        <Text style={isActive ? styles.ActiveHeader : styles.InActiveHeader}>
          {section.title}
        </Text>
        <View style={styles.iconContainer}>
          <Image
            resizeMode="contain"
            style={isActive ? styles.activeimg : styles.imgStyles}
            source={icons.arrow_blue}
          />
        </View>
      </Animatable.View>
    );
  }
  _renderContent(section, i, isActive, sections) {
    return (
      <Animatable.View
        duration={300}
        transition="backgroundColor"
        style={{
          backgroundColor: colors.colorPrimary,
          width: '100%',
        }}>
        {section.content}
      </Animatable.View>
    );
  }

  _updateSections = activeSections => {
    this.setState({activeSections});
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationHeader
          title={'Scheduled Visits'}
          navigation={this.props.navigation}
        />
        <View style={styles.Subcontainer}>
          <Spinner
            visible={this.state.isloading}
            color={theme.colors.colorPrimary}
          />

          <Accordion
            sections={this.sections()}
            activeSections={this.state.activeSections}
            renderHeader={this._renderHeader}
            renderContent={this._renderContent}
            onChange={this._updateSections}
            containerStyle={{marginTop: 20}}
          />
          <View style={styles.scheduleCallButton}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => this.props.navigation.navigate('AddSchedule')}
              style={styles.scheduleBtn}>
              <Text style={[theme.palette.buttonText]}>Schedule Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
