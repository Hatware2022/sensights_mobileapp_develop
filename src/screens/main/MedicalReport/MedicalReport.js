import {showMessage} from '../../../utils';
import {FlatList, View, StyleSheet, Alert,Text, TouchableOpacity} from 'react-native';
import {
  NoDataState,
  SearchBar,
  TasksItem,
  NavigationHeaderV2,
} from '../../../components';
import React, {Component} from 'react';

import Dialog from 'react-native-dialog';
import {HeaderBackButton} from 'react-navigation-stack';
import Spinner from 'react-native-loading-spinner-overlay';
import {api} from '../../../api';
import {theme} from '../../../theme';
import Snackbar from 'react-native-snackbar';
import axios from 'axios';
import { MedicalListItem } from '../../../components/MedicalList/MedicalList';

export class MedicalReport extends Component {
  static navigationOptions = ({navigation}) => {
    return {
      title: 'Medical Report',
      headerTintColor: 'white',
      headerTitleStyle: {fontSize: 24},
      headerStyle: {backgroundColor: theme.colors.colorPrimary},
      headerLeft: (
        <HeaderBackButton
          tintColor={theme.colors.white}
          onPress={async () => {
            await navigation.getParam('getTasksFromServer')();
            navigation.goBack();
          }}
        />
      ),
    };
  };

  constructor(props) {
    super(props);
    const {getParam} = this.props.navigation;
    this.role = getParam('userType');
    this.state = {
      tasks: [],
      medicalRecord:[],
      spinner: false,
      taskDialog: false,
    };
    this.arrayHolder = [];
    this.completedTaskId = null;
  }

  componentDidMount() {
    this.setState({spinner: true});
    this.getRecordFromServer();
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      // The screen is focused
      // Call any action
      this.getRecordFromServer();
    });
  }

  searchFilter = text => {
    const newData = this.arrayHolder.filter(item => {
      // return item.taskname.toLowerCase().includes(text.toLowerCase());
      return item.taskDescription.toLowerCase().includes(text.toLowerCase());
    });
    this.setState({tasks: newData});
  };

  getRecordFromServer = async () => {
    try {
      this.setState({spinner: true});
      // const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);

      await axios
        .get(api.baseURL + 'SeniorMedicalDetails/Get/ByAll')
        .then(res => {
            console.log('GET MEDICAL REPORT><><><><><>',res.data)
          if (res?.data != null) {
            this.arrayHolder = res?.data;
            this.setState({spinner: false, medicalRecord: res?.data});
          }
          this.setState({spinner: false});
        })
        .catch(err => {
          this.setState({spinner: false});
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });

    } catch (err) {
      this.setState({spinner: false});
      showMessage('Error in getting task');
    }
  };

  showTaskCompleteDialog = id => {
    this.completedTaskId = id;
    this.setState({taskDialog: true});
  };

  markTaskAsCompleted = async () => {
    try {
      this.setState({spinner: true, taskDialog: false});
      // const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
      const reqBody = {
        taskId: this.completedTaskId,
        taskStatus: true,
      };
      await axios
        .put(api.updateTaskStatus, reqBody)
        .then(res => {
          if (res?.data != null) {
            const newData = this.state.tasks.map(item => {
              if (res?.data?.id == item.id) {
                item.taskStatus = true;
              }
              return item;
            });
            this.setState({tasks: newData, spinner: false, taskDialog: false});
          } else {
            this.setState({spinner: false});
            showMessage('Unable to mark task as completed');
          }
        })
        .catch(err => {
          this.setState({spinner: false});
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });
    } catch (err) {
      this.setState({spinner: false});
      showMessage('Error in marking task');
    }
  };

  handleDelete= async(documentId)=>{
    try {
      await axios
        .delete(`${api.deleteMedicalReport}${documentId}`)
        .then(res => {
            console.log('DELETED <><>><><',res)
       Snackbar.show({
        text: 'Deleted successfully',
        duration: Snackbar.LENGTH_SHORT,
      });
       this.getRecordFromServer();
        })
        .catch(err => {
          // alert(err)
          this.setState({spinner: false});
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationHeaderV2
          title="Medical Report"
          allowBack
          navigation={this.props.navigation}
          rightComponent={<TouchableOpacity onPress={()=>this.props.navigation.navigate('AddEditMedicalReportForm')}><Text style={{color:'#fff',fontSize:14}}>Add New</Text></TouchableOpacity>}
        />

        <View style={styles.subContainer}>
          <Spinner visible={this.state.spinner} />
          <View>
            <SearchBar searchFilter={this.searchFilter} />
          </View>

          {this.state.medicalRecord.length ? (
            <FlatList
              data={this.state.medicalRecord}
              renderItem={({item}) => (
                <MedicalListItem
                  title={item.title}
                  message={item.message}
                  description={item.taskDescription}
                  time={item.createdDate}
                  checked={item.taskStatus}
                  priority={item.taskPriority}
                  assignedToName={item.assignedToName}
                  createdByName={item.createdByName}
                  taskDueDate={item.taskDate}
                  taskPriority={item.taskPriority}
                  id={item.id}
                  showTaskCompleteDialog={this.showTaskCompleteDialog}
                  onPressEdit={()=>this.props.navigation.navigate('AddEditMedicalReportForm',{edit:true,item:item})}
                  onPressDelete={()=> Alert.alert(
                    'Warning',
                    'Are you sure, you want to delete',
                    [
                      {
                        text: 'No',
                        onPress: () => console.log('Cancel Pressed'),
                        style: 'cancel',
                      },
                      {
                        text: 'Yes', 
                        onPress: () => this.handleDelete(item.id)
                      },
                    ],
                    {cancelable: false},
                  )}
                  // onPressDelete={()=>this.handleDelete(item.id)}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <NoDataState text="No Medical Report available" />
          )}
        </View>

        <Dialog.Container visible={this.state.taskDialog}>
          <Dialog.Title style={{textAlign: 'center'}}>
            Task Confirmation
          </Dialog.Title>
          <Dialog.Description>
            Are you sure task is completed?
          </Dialog.Description>
          <Dialog.Button label="Ok" onPress={this.markTaskAsCompleted} />
          <Dialog.Button
            label="Cancel"
            onPress={() => this.setState({taskDialog: false})}
          />
        </Dialog.Container>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.colorPrimary,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  subContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  heading: {
    fontFamily: theme.fonts.SFProRegular,
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  text: {
    fontFamily: theme.fonts.SFProRegular,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: 'rgba(0, 0, 0, 0.48)',
  },
});
