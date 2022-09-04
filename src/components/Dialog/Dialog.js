import React, { useEffect, useState } from "react";
import {Text} from 'react-native';

import RNDialog from "react-native-dialog";
import { styles } from "./styles";

export const Dialog = (props) => {
  const {
    visible,
    title,
    description,
    placeholder,
    onCancel,
    onSave,
    keyboardType,
    setValue,
    userDescription
  } = props;
  const [input, setInput] = useState("");

  useEffect(() => {
    setValue(() => setInput(""));
  });

  if (!visible) {
    return null;
  }
  return (
    <RNDialog.Container visible={visible}>
      <RNDialog.Title>{title || "Add geofence"}</RNDialog.Title>
      <RNDialog.Description>
        {description || "Enter the geofence you want to add (meters)"}
      </RNDialog.Description>
      <RNDialog.Input
        style={styles.input}
        placeholder={placeholder || "Geofence (in meters)"}
        placeholderTextColor="rgba(0,0,0,0.2)"
        keyboardType={keyboardType ? keyboardType : "numeric"}
        onChangeText={(text) => setInput(text)}
      />          
      {userDescription ?
      <Text
              style={{
                alignContent:'center',
                justifyContent:'center',
                fontSize: 15,
                marginHorizontal: 10,
                color: "black",
                marginBottom: 10
              }}>{"Your profile, health and location data will be shared with caregiver upon sending/accepting request to/from caregiver."}</Text>
              :null}
      <RNDialog.Button label="Cancel" onPress={onCancel} />
      <RNDialog.Button label="Save" onPress={() => onSave(input)} />
    </RNDialog.Container>
  );
};
