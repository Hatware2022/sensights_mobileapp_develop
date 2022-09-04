import {
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  Linking,
} from 'react-native';
import React from 'react';
import {theme} from '../../../theme';
import {images} from '../../../assets';
import colors from '../../../theme/colors';

export const SocialScreen = props => {
 
  if (Platform.OS === 'android') {
    StatusBar.setBackgroundColor(theme.colors.colorPrimary);
  }

  linkedInNavigator = () => {
    Linking.canOpenURL(theme.strings.social_url).then(supported => {
      if (supported) {
        Linking.openURL(theme.strings.social_url);
      } else {
        alert('Not able to open the Markitech linkedIn page');
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.markitechLogoCOntainer}>
        <Image
          style={styles.imgStyle}
          resizeMode="contain"
          source={images.markitech}
        />
      </View>
      <View style={styles.ButtonContainer}>
        <TouchableOpacity
          style={styles.linkedinImgContainer}
          onPress={linkedInNavigator}>
          <Image
            source={images.linkedin}
            style={styles.imgStyle}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    alignItems: 'center',
  },

  linkedinImgContainer: {
    height: '13%',
    width: '75%',
    borderWidth: 0.5,
    borderRadius: 20,
    paddingVertical: 5,
    borderColor: colors.colorPrimary,
    marginBottom: 50,
  },
  imgStyle: {
    height: '100%',
    width: '100%',
  },
  webview: {
    marginTop: Platform.OS === 'ios' ? 1 : StatusBar.currentHeight,
  },
  ButtonContainer: {
    height: '60%',
    width: '100%',
    alignItems: 'center',

    justifyContent: 'flex-end',
  },
  markitechLogoCOntainer: {
    height: '15%',
    width: '80%',
    marginTop: 20,
  },
});
