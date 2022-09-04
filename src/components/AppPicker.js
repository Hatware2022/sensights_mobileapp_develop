import React, {useState} from 'react';
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  View,
  Image,
} from 'react-native';
import RNPickerSelect, {defaultStyles} from 'react-native-picker-select';
import {icons} from '../assets';
import colors from '../theme/colors';

import fonts from '../theme/fonts';
const AppPicker = props => {
  const [previousState, setPreviousState] = useState(null);
  var pickerRef;
  const InputAccessoryView = () => {
    return (
      <View style={defaultStyles.modalViewMiddle}>
        <TouchableWithoutFeedback
          onPress={() => {
            pickerRef.togglePicker(true);
            props.onValueChange(previousState);
          }}
          hitSlop={{top: 4, right: 4, bottom: 4, left: 4}}>
          <View testID="needed_for_touchable">
            <Text style={pickerSelectStyles.CancelTextStyle}>Cancel</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => {
            pickerRef.togglePicker(true);
          }}
          hitSlop={{top: 4, right: 4, bottom: 4, left: 4}}>
          <View testID="needed_for_touchable">
            <Text style={pickerSelectStyles.DoneTextStyle}>Done</Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };
  return (
    <>
      {props.pickertitle && (
        <Text style={styles.titleStyle}>{props.pickertitle}</Text>
      )}

      <RNPickerSelect
        value={props.value}
        placeholder={{
          label: props.title,
          value: null,

          color: colors.grey_shade_1,
        }}
        onOpen={() => {
          setPreviousState(props.value);
        }}
        onValueChange={val => {
          props.onValueChange(val);
        }}
        ref={ref => {
          pickerRef = ref;
        }}
        items={props.items}
        useNativeAndroidPickerStyle={false}
        InputAccessoryView={InputAccessoryView}
        style={{
          // ...pickerSelectStyles,
          inputAndroid:
            props.value == '' || props.value == null || props.value.length <= 0
              ? pickerSelectStyles.inputAndroid
              : pickerSelectStyles.selectinputAndroid,
          inputIOS:
            props.value == '' || props.value == null || props.value.length <= 0
              ? pickerSelectStyles.inputAndroid
              : pickerSelectStyles.selectinputAndroid,
          iconContainer: {
            top: 0,
            bottom: 0,
            right: 10,
            justifyContent: 'center',
          },
          placeholder: {
            color: colors.grey_shade_1,
            fontSize: 16,
            fontFamily: fonts.SFProRegular,
          },
        }}
        Icon={() => {
          return (
            <Image
              disabled
              source={icons.down_arrow}
              // imgstyle={{
              //   tintColor:
              //     props.value == '' ||
              //     props.value == null ||
              //     props.value.length <= 0
              //       ? Appcolors.TEXT_MID
              //       : Appcolors.PRIMARY,
              // }}

              style={pickerSelectStyles.chevronContainer}
            />
          );
        }}
      />
    </>
  );
};

export default AppPicker;
const pickerSelectStyles = StyleSheet.create({
  inputAndroid: {
    fontSize: 16,
    fontFamily: fonts.Poppins_Regular400,
    backgroundColor: colors.grey_shade_4,
    borderRadius: 8,
    // borderWidth: 1.5,
    //   borderColor: Appcolors.Grey95,
    //   color: Appcolors.TEXT_COLOR,
    padding: 16,
  },
  selectinputAndroid: {
    fontSize: 16,
    // fontFamily: Appfonts.Poppins_Regular400,
    backgroundColor: colors.grey_shade_4,
    borderRadius: 8,
    // borderWidth: 1.5,
    //   borderColor: Appcolors.PRIMARY,
    //  color: Appcolors.TEXT_COLOR,
    padding: 16,
  },
  chevronContainer: {
    width: 15,
    height: 10,
    tintColor: colors.black,
  },
  CancelTextStyle: {
    fontSize: 16,
    color: colors.red_shade_1,
    fontFamily: fonts.SFProSemibold,
  },
  DoneTextStyle: {
    fontSize: 16,
    color: colors.colorPrimary,
    fontFamily: fonts.SFProSemibold,
  },
});
const styles = StyleSheet.create({
  titleStyle: {
    fontSize: 17,
    fontFamily: fonts.SFProBold,
    color: colors.black,
    marginBottom: 7,
    marginTop: 11,
  },
});
