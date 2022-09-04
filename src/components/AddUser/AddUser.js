import {Image, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {AlertHelper} from '../AlertHelper';
import {Dialog} from '../Dialog/Dialog';
import Spinner from 'react-native-loading-spinner-overlay';
import {api} from '../../api';
import {icons} from '../../assets';
import axios from 'axios';

export const AddUser = props => {
  const {type, user} = props;
  const [dialog, setDialog] = useState(false);
  const [isLoading, setLoading] = useState(false);

  let resetEmailValue = () => {};

  const onSave = async code => {
    // const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
    setDialog(false);
    try {
      setLoading(true);
      const reqBody =
        type == 'senior' ? {seniorEmail: code} : {caregiverEmail: code};
      const uri = type == 'senior' ? api.invitesCaregiver : api.invitesSenior;
      await axios
        .post(uri, reqBody)
        .then(res => {
          if (res?.data != null) {
            setLoading(false);
            AlertHelper.show({
              description: `${res?.data?.message}`,
              cancelBtn: {negativeBtnLable: 'Ok'},
            });
          }
        })
        .catch(err => {
          setLoading(false);
          AlertHelper.show({
            description: `${err?.description}`,
            cancelBtn: {negativeBtnLable: 'Ok'},
          });
        });
    } catch (err) {
      setLoading(false);
      AlertHelper.show({
        description: `Oops! Error in adding ${
          type === 'senior' ? user[0].toLowerCase() : user[1].toLowerCase()
        }`,
        cancelBtn: {negativeBtnLable: 'Ok'},
      });
    }
  };

  return (
    <>
      <Spinner visible={isLoading} />
      <View
        style={{
          height: type === 'senior' ? 75 : 55,
          width: 60,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View>
          <TouchableOpacity onPress={() => setDialog(true)}>
            <Image source={icons.add_green} style={{alignSelf: 'center'}} />
          </TouchableOpacity>
        </View>
        <Dialog
          visible={dialog}
          title={`Add ${type === 'senior' ? user[0] : user[1]}`}
          description={`Add email of ${
            type === 'senior' ? user[0].toLowerCase() : user[1].toLowerCase()
          }`}
          placeholder="email"
          onCancel={() => setDialog(false)}
          onSave={onSave}
          keyboardType="email-address"
          setValue={reset => (resetEmailValue = reset)}
          userDescription={true}
        />
      </View>
    </>
  );
};
