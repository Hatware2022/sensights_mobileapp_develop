import {
  AppConstants,
  StorageUtils,
  showMessage,
} from '../../../utils';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  Image,
  Platform
} from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  NavigationHeaderV2,
} from '../../../components';
import { api } from '../../../api';
import { theme } from '../../../theme';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import Snackbar from 'react-native-snackbar';

export const AddEditMedicalReportForm = props => {
  const noteId = props.navigation.getParam('noteId', null);
  const name = props.navigation.getParam('name', null);
  const alert2 = props.navigation.getParam('alert', null);

  const [message, setMessage] = useState(props.navigation.state.params?.item?.message)
  const [careGiverList, setCareGiverList] = useState(null)
  const [selectedCareGiverList, setSelectedCareGiverList] = useState([])
  const [file, setFile] = useState(props.navigation.state.params?.item)
  const [selectedCareGiver, setSelectedCareGiver] = useState('')
  const [loadingSave, setLoadingSave] = useState(false);



  useEffect(() => {
    getListFromServer()
  }, []);

  const getListFromServer = async () => {
    try {
      await axios
        .get(api.careGiver)
        .then(res => {
          console.log('getting careGiver responce', res.data)
          if (res?.data != null) {
            setLoadingSave(false);
            let temp = []
            res.data.forEach((e, i) => {
              temp.push({ ...e, checked: false })
            })
            if(props.navigation.state.params?.item?.permissions && props.navigation.state.params?.item?.permissions.length>0){
              props.navigation.state.params?.item?.permissions.forEach((f,j)=>{
              temp.forEach((e, i) => {
                if(e.careGiverId === f.userId){
                  e.checked = true 
                }
              })
            })
            }
            setCareGiverList(temp)
          }
          setLoadingSave(false);
        })
        .catch(err => {
          console.log(err)
          setLoadingSave(false);
          setTimeout(() => {
            showMessage('Error in getting caregiver list');
          }, 100);
        });
    } catch (err) {
      console.log(err)
      setLoadingSave(false);
      showMessage('Network issue try again');
    }
  }



  const handleSelectedCaregiver = (id) => {
    let temp = []
    let list = []
    careGiverList.forEach((e, i) => {
      e.careGiverId === id ? temp.push({ ...e, checked: !e.checked }) : temp.push(e)
    })
    selectedCareGiverList.forEach((e, i) => {
      e === id ? [] : list.push(e)
    })
    setSelectedCareGiverList(list)
    setCareGiverList(temp)
  }

  const handleUploadDocument = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [Platform.OS==='ios'?"public.item":"*/*"],
      });
      //Printing the log realted to the file
      setFile(res)
      console.log('res : ' + JSON.stringify(res));
      //Setting the state to show single file attributes
    } catch (err) {
      //Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        //If user canceled the document selection
        alert2('Canceled from single doc picker');
      } else {
        //For Unknown Error
        alert2('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  }

  const handleEditMedicalReport = async () => {
    if(!file){
      alert('File is required')
      return
    }
    if(message && message ===''){
      alert('Message is required')
      return
    }
    handlePermissionsMedicalReport(props.navigation.state.params?.item?.id,true)
    const userId = await StorageUtils.getValue(AppConstants.SP.USER_ID);
    let formdata = new FormData();
    if(file || file?.[0].uri === undefined || file && file?.[0].uri === null){
      formdata.append("PatientId", userId)
      formdata.append("Message", message)
      formdata.append("Comments", message)
    }
    else{
    formdata.append("AttachmentPath", file?.[0]?.uri)
    formdata.append("PatientId", userId)
    formdata.append("Message", message)
    formdata.append("Comments", message)
    formdata.append("MedicalAttachment", file?.[0])
    }

        try {
          let response = await axios({
            url: `${api.addMedicalReportTest}/${props.navigation.state.params?.item?.id}`,
            method: 'PUT',
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            data: formdata,
          })
            .then(res => {
              if (res?.data != null) {
                console.log('Edit Successsuccess',res)
                // props.navigation.goBack()
              }
            })
            .catch(err => {
              console.log('error : ',err);
              setTimeout(() => {
                Snackbar.show({
                  text: err?.description,
                  duration: Snackbar.LENGTH_SHORT,
                });
              }, 100);
            });
        } catch (err) {
          console.log('89098909',err)
          showMessage('Network issue try again');
        }
  }

  const handleAddMedicalReport = async () => {
    if(!file){
    // if(file?.[0].uri === undefined || file?.[0].uri === null){
      alert('File is required')
      return
    }
    if(message && message ===''){
      alert('Message is required')
      return
    }
    const userId = await StorageUtils.getValue(AppConstants.SP.USER_ID);
    
console.log('sadhui')
let formdata = new FormData();

formdata.append("AttachmentPath", file?.[0].uri)
formdata.append("PatientId", userId)
formdata.append("Message", message)
formdata.append("Comments", message)
formdata.append("MedicalAttachment", file?.[0])
    try {
      let response = await axios({
        url: api.addMedicalReport,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        data: formdata,
      })
        .then(res => {
          if (res?.data != null) {
            console.log('success',res)
            handlePermissionsMedicalReport(res.data.id)
            // props.navigation.goBack()
          }
        })
        .catch(err => {
          console.log('error : ',err);
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });
    } catch (err) {
      console.log('89098909',err)
      showMessage('Network issue try again');
    }
  }

  const handlePermissionsMedicalReport = async (userIs) => {
    let list = []
    careGiverList.forEach((e,i)=>{
      if(e.checked){
      list.push({userId: e.careGiverId})
      }
    })
    const userId = await StorageUtils.getValue(AppConstants.SP.USER_ID);
    const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);

    console.log('listtt',list)
    console.log('iddd',props.navigation.state.params?.item?.id)
    console.log('token',token)
    console.log('urllll',`${api.addPermissionCareGiver}+"?Id="+${props.navigation.state.params?.item?.id}`)
    try {
      let response = await axios({
        url: `${api.addPermissionCareGiver}?Id=${userIs}`,
        method: 'POST',
        headers:{
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        },
        data: list,
      });
      console.log('response while Sending Password Reset Email', response);
      props.navigation.goBack()
     
    } catch (error) {
      // setLoading(false)
      console.log('Error while Sending Password Reset Email => ' + error);
      // showToast(t('common:account_doesnot_exist'))
    }


    // try {
    //   let response = await axios.post(api.addPermissionCareGiver+"?Id="+userId,
    //    {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //     Authorization: 'Bearer ' + token,
    //   }, list
    //   );
    //   console.log('handlePermissionsMedicalReport : response ', response);
    // } catch (error) {
    //   console.log('action error => ', error);
    // }
    // try {
    //   let response = await axios({
    //     url: api.addPermissionCareGiver+"?Id="+userId,
    //     method: 'POST',
    //     headers: {
    //       Accept: 'application/json',
    //       'Content-Type': 'application/json',
    //       Authorization: 'Bearer ' + token,
    //     },
    //     data: list,
    //   })
    //     .then(res => {
    //       console.log('handlePermissionsMedicalReport : ',res)
    //       if (res?.data != null) {
    //         console.log('handlePermissionsMedicalReport : ',res)
    //       }
    //     })
    //     .catch(err => {
    //       setTimeout(() => {
    //         console.log('handlePermissionsMedicalReport error : ',err);
    //         Snackbar.show({
    //           text: err?.description,
    //           duration: Snackbar.LENGTH_SHORT,
    //         });
    //       }, 100);
    //     });

    //     console.log('responseeee : ',response)

    // } catch (err) {
    //   console.log('handlePermissionsMedicalReport err : ',err)
    //   showMessage('Network issue try again');
    // }
  }
  return (
    <View style={styles.container}>
      <SafeAreaView
        style={[styles.root, { backgroundColor: theme.colors.colorPrimary }]}>
        <NavigationHeaderV2
          title={props.navigation.state.params?.edit ? 'Edit Medical Report' : 'Add Medical Report'}
          allowBack={true}
          navigation={props.navigation}
        />

        <ScrollView style={{ backgroundColor: theme.colors.white }}>
          <View style={{ padding: 20 }}>
            <Text>File</Text>
            <TouchableOpacity style={styles.uploadBtn} onPress={() => handleUploadDocument()}>
              <Text style={styles.btnTxt}>Upload</Text>
            </TouchableOpacity>
            {file?.[0]?.name != null || props.navigation.state.params?.edit ?
              <Text style={{ marginTop: 10 }}>{file.attachmentName === undefined ? file?.[0]?.name : file.attachmentName}</Text> : null
            }


            <Text style={styles.heading}>Message</Text>
            <TextInput
              placeholder='Message'
              value={message}
              onChangeText={(e) => setMessage(e)}
              style={styles.textinput} />


            <Text style={styles.heading}>Select Caregivers to View</Text>
            <FlatList
              data={careGiverList}
              style={{ marginTop: 5 }}
              horizontal
              renderItem={({ item, index }) => (
                <TouchableOpacity style={styles.flatlistContainer} onPress={() => handleSelectedCaregiver(item.careGiverId)}>
                  <Image source={item.profileImage} style={[styles.flatlistImg, { borderColor: item.checked === true ? 'green' : 'lightgrey', }]} />
                  <View style={styles.flatlistTxt} >
                    <Text style={{ alignSelf: 'center', marginTop: 3 }}>{item.firstName}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity 
            onPress={()=>props.navigation.state.params?.edit ? handleEditMedicalReport() : handleAddMedicalReport()}
            style={styles.addBtn}><Text style={styles.btnTxt}>{props.navigation.state.params?.edit ? 'Update' : 'Add'}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
const styles = StyleSheet.create({
  label: { fontSize: 18, fontFamily: theme.fonts.SFProSemibold },
  input: {
    // height: Dimensions.get("window").height / 4,
    // justifyContent: "flex-start",
    fontSize: 18,
    borderWidth: 1,
    borderColor: theme.colors.grey_shade_1,
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: 'white',
    minHeight: 50,
  },

  root: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingTop: Platform.OS === 'ios' ? 35 : 25,
  },
  inputView: {
    borderColor: theme.colors.grey_shade_1,
    borderWidth: 1,
    padding: 5,
    margin: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  buttonView: {
    alignItems: 'flex-end',
    width: '100%',
  },
  notes: {
    height: Dimensions.get('window').height / 2,
    fontFamily: theme.fonts.SFProRegular,
    fontSize: 16,
  },
  elementLeft: {
    fontFamily: theme.fonts.SFProRegular,
    fontSize: 16,
    fontWeight: '400',
  },
  elementRight: {
    fontFamily: theme.fonts.SFProRegular,
    fontSize: 16.5,
    marginHorizontal: 10,
  },
  container: { flex: 1, backgroundColor: theme.colors.colorPrimary },
  uploadBtn: { width: 100, height: 35, backgroundColor: 'lightgrey', borderRadius: 5 },
  btnTxt: { alignSelf: 'center', fontSize: 14, marginTop: 7 },
  heading: { marginTop: 10, fontSize: 14, fontWeight: 'bold' },
  textinput: { width: '100%', height: 45, borderRadius: 5, paddingLeft: 10, borderColor: 'grey', borderWidth: 1, alignSelf: 'center', marginTop: 10 },
  addBtn: { width: 100, height: 35, backgroundColor: theme.colors.colorPrimary, borderRadius: 5, alignSelf: 'center', marginTop: 30 },
  flatlistContainer: { flexDirection: 'column' },
  flatlistImg: { width: 80, height: 80, borderRadius: 50, borderWidth: 4, marginRight: 10, marginBottom: 10 },
  flatlistTxt: { minWidth: 60, height: 30, paddingHorizontal: 5, borderColor: 'black', borderWidth: 1, marginRight: 10, borderRadius: 5 },

});
