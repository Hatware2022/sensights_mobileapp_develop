import React from 'react'
import {Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import colors from "../../theme/colors";
import fonts from "../../theme/fonts";
import {icons, images} from "../../assets";


export const DisclaimerVeyetal = ({showModal,onClose,onNext})=> {

        const handleOnResearch = ()=> {
            Linking.openURL("https://veyetals.com/publications/")
        }

        const handleOnClinicalStudies = ()=> {
            Linking.openURL("https://veyetals.com/pilots/")
        }

         return(
            <Modal
                animationType="fade"
                transparent={false}
                visible={showModal}
                onRequestClose={() => {
                    onClose();
                }}
            >
               <View style={styles.container}>
                   <TouchableOpacity style={styles.backArrowContainer} onPress={onClose}>
                       <Image source={icons.arrow_blue}/>
                   </TouchableOpacity>
                   <View style={styles.sectionOne}>
                       <Text style={styles.textTitle}>{"Disclaimer"}</Text>
                       <Text style={styles.textMessage}>VeyetalsApp is not a substitute for the clinical judgment of a health care professional.
                           VeyetalsApp is intended to improve your awareness of general wellness. VeyetalsApp does
                           not diagnose, treat, mitigate or prevent any disease, symptom, disorder or abnormal
                           physical state. Consult with a health care professional or emergency services if you
                           believe you may have a medical issue.
                       </Text>
                   </View>
                   <View style={styles.sectionTwo}>
                       <Text style={styles.readPublication}>Read our publications : </Text>
                       <View style={styles.row}>
                           <View style={styles.optionContainerWrapper}>
                               <TouchableOpacity style={styles.optionContainer} onPress={handleOnClinicalStudies}>
                                   <Image style={styles.optionImage} source={images.fileDisclaimer}/>
                               </TouchableOpacity>
                               <Text style={styles.optionText}>Clinical Studies</Text>
                           </View>
                           <View style={{width:60}}/>
                           <View style={styles.optionContainerWrapper}>
                              <TouchableOpacity style={styles.optionContainer} onPress={handleOnResearch}>
                                    <Image  style={styles.optionImage} source={images.searchDisclaimer}/>
                               </TouchableOpacity>
                               <Text style={styles.optionText}>Research</Text>
                           </View>
                       </View>
                       <TouchableOpacity style={styles.nextButtonContainer} onPress={onNext}>
                           <Text style={styles.nextText}>Next</Text>
                       </TouchableOpacity>
                   </View>
               </View>
            </Modal>
        )
}

const styles = StyleSheet.create({
    container : {
        paddingVertical : 56,
        flex:1
    },
    textTitle : {
        marginHorizontal:32,
        color : colors.red_shade_1,
        fontSize : 20,
        fontWeight : "bold",
        fontFamily:fonts.SFProBold,
        textAlign:"center"
    },
    textMessage : {
        marginHorizontal:32,
        color : "#125090",
        fontSize : 18,
        lineHeight :26,
        fontFamily:fonts.SFProRegular,
        textAlign:"justify",
        marginVertical:18
    },
    readPublication : {
        marginHorizontal:32,
        color : "#125090",
        fontSize : 18,
        lineHeight :26,
        fontFamily:fonts.SFProBold,
        textAlign:"justify",
        marginVertical:18
    },
    sectionOne:{
        flex:0.6,
        justifyContent:'center',
        alignItems:"center"
    },
    sectionTwo:{
        flex:0.4,
        justifyContent:'center',
        alignItems:"center"
    },
    row:{
        flexDirection : "row",
        marginTop:9,
        marginStart:-16
    },
    optionContainer:{
        width:60,
        height:60,
        borderRadius:30,
        borderColor:"#125090",
        justifyContent:"center",
        alignItems:"center",
        borderWidth:2
    },
    optionImage:{
        width:30,
        height:30
    },
    optionText:{
        color : "#125090",
        fontSize : 12,
        fontFamily:fonts.SFProRegular,
        textAlign:"justify",
        marginVertical:9
    },
    optionContainerWrapper:{
        justifyContent:"center",
        alignItems:"center"
    },
    nextButtonContainer:{
        width:150,
        height:48,
        marginTop:30,
        borderRadius:8,
        backgroundColor:colors.colorPrimary,
        justifyContent:"center",
        alignItems:"center"
    },
    nextText:{
        color : "white",
        fontSize : 18,
        fontFamily:fonts.SFProRegular,
        textAlign:"justify",
    },
    backArrowContainer:{
        width:50,
        height:50,
        justifyContent:"center",
        alignItems:"center"
    }
})
