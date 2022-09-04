import RNDialog from "react-native-dialog";
import React from "react";

export default InfoDialog = (props) => {
  const {
    visible,
    title,
   onContinue,
    description,
   
  } = props;
  if (!visible) {
    return null;
  }
  return (
    <RNDialog.Container visible={visible}>
      <RNDialog.Title >{title}</RNDialog.Title>
      <RNDialog.Description>
        {description}
      </RNDialog.Description>
      <RNDialog.Button label={"OK"} onPress={onContinue} />
     
    </RNDialog.Container>
  );
};
