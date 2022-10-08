import {showMessage} from '../../utils';
import React, {useEffect, useState} from 'react';

import {CheckBox} from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import {api} from '../../api';
import {theme} from '../../theme';
import Snackbar from 'react-native-snackbar';
import axios from 'axios';

export const PrimaryCheckbox = ({
  id: caregiverId,
  userType: userType,
  value,
  fetchUsers,
}) => {
  const [checkbox, setCheckbox] = useState(value);
  const [loadingPrimary, setLoadingPrimary] = useState(false);
  useEffect(() => {}, [checkbox]);

  const onCheckPrimary = async () => {
    setCheckbox(true);
    setLoadingPrimary(true);

    // const token = await StorageUtils.getValue(AppConstants.SP.ACCESS_TOKEN);
    const body = new FormData();
    body.append('caregiverId', caregiverId);
    body.append('setPriority', 1);

    try {
      await axios
        .put(api.caregiverPriority, body)
        .then(res => {
          if (res?.data != null) {
            setLoadingPrimary(false);
            showMessage(
              userType
                ? userType + ' set as primary ' + userType
                : 'Caretaker set as primary Caretaker',
            );
            if (fetchUsers) fetchUsers();
          }
        })
        .catch(err => {
          setCheckbox(false);
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });

      // const res = await fetch(api.caregiverPriority, {
      //   method: 'put',
      //   headers: {
      //     Accept: 'application/json',
      //     'Content-Type': 'multipart/form-data',
      //     Authorization: 'Bearer ' + token,
      //   },
      //   body,
      // });

      // if (res) {
      //   // setLoadingPrimary(false);
      //   if (res.ok) {
      //     const json = await res.json();

      //     if (json) {
      //       setLoadingPrimary(false);
      //       showMessage('Supervisor set as primary cargiver');
      //       if (fetchUsers) fetchUsers();
      //     }
      //   } else {
      //     setCheckbox(false);
      //     showMessage('Error!', 'long');
      //   }
      // }
    } catch (error) {
      setLoadingPrimary(false);
      setCheckbox(false);
      showMessage('Error!', 'long');
    }

    try {
      await axios
        .put(`${api.caregiverPriorityPriority}${caregiverId}`,)
        .then(res => {
          if (res?.data != null) {
            alert(JSON.stringify(res))
            setLoadingPrimary(false);
            showMessage(
              userType
                ? userType + ' set as primary ' + userType
                : 'Caretaker set as primary Caretaker',
            );
            if (fetchUsers) fetchUsers();
          }
        })
        .catch(err => {
          console.log('eerrr',err)
          setCheckbox(false);
          setTimeout(() => {
            Snackbar.show({
              text: err?.description,
              duration: Snackbar.LENGTH_SHORT,
            });
          }, 100);
        });

    } catch (error) {
      setLoadingPrimary(false);
      setCheckbox(false);
      showMessage('Error!', 'long');
    }
    
  };

  return (
    <>
      <Spinner visible={loadingPrimary} />
      <CheckBox
        title={`${checkbox ? 'Sets' : 'Set'} Primary`}
        containerStyle={{width: '96%', marginVertical: 12}}
        size={32}
        checked={checkbox}
        checkedColor={theme.colors.colorPrimary}
        onPress={checkbox ? undefined : onCheckPrimary}
      />
    </>
  );
};
