import {StyleSheet, Dimensions, Platform} from 'react-native';
import * as Utility from '../Streamer/utils/utility';
import {theme} from '../../../theme';
import colors from '../../../theme/colors';

let {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black', // '#3498db',
  },

  blackCircle: {
    position: 'absolute',
    alignSelf: 'center',
    width: width * 2.7,
    height: width * 2.7,
    left: -(width * 0.85),
    top: -((width * width) / height),
    borderWidth: width,
    borderRadius: 5000,
    borderColor: 'rgba(1, 1, 1, 1)',
  },

  bodyWrapper: {
    padding: 30,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraView: {
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: (Utility.screenHeight * 0.42) / 2,
    overflow: 'hidden',
    borderStyle: 'dashed',
    alignSelf: 'center',
    height: Utility.screenHeight * 0.42,
    width: Utility.screenHeight * 0.42,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraViewBox: {
    borderWidth: 1,
    borderColor: '#FFF',
    overflow: 'hidden',
    borderStyle: 'dashed',
    alignSelf: 'center',
    height: Utility.screenHeight * 0.35,
    width: (Utility.screenHeight * 0.42) / 2,
  },
  cameraView_camera: {
    height: '100%',
    width: '100%',
  },

  note: {color: '#FFFFFF', textAlign: 'center', fontSize: 12, marginBottom: 4},
  infoBox: {
    width: Dimensions.get('screen').width,
    minWidth: 300,
  },
  progressText: {
    position: 'absolute',
    top: -2,
    // zIndex: 10, alignSelf: 'center', bottom: 0.1,
    width: '100%',
    textAlign: 'center',
    color: 'white',
  },
  infoLabel: {
    color: theme.colors.colorPrimary,
  },
  infoValue: {
    textAlign: 'right',
    marginRight: 10,
  },

  contentWrapper: {flex: 1},
  header: {flex: 0.1, justifyContent: 'space-around', flexDirection: 'row'},
  footer: {flex: 0.1},
  center: {flex: 0.8},
  streamerView: {
    borderWidth: 1,
    // position: 'relative',
    // top: Platform.OS == 'android' ? Utility.screenHeight * 0.24 : Utility.screenHeight * 0.2,
    // left: Utility.screenWidth * 0.1,
    height:
      Platform.OS == 'android'
        ? Utility.screenHeight * 0.4
        : Utility.screenHeight * 0.42,
    // alignItems: 'center',
    width: Utility.screenWidth * 0.8,
    // width: "100%",
    // height: "50%",
  },
  streamerViewWeb: {
    position: 'relative',
    //top: Platform.OS == 'android' ? Utility.screenHeight * 0.24 : Utility.screenHeight * 0.2,
    height:
      Platform.OS == 'android'
        ? Utility.screenHeight * 0.4
        : Utility.screenHeight * 0.42,
    alignItems: 'center',
    width: Utility.screenWidth,
  },
  streamerViewWebRemote: {
    position: 'relative',
    top:
      Platform.OS == 'android'
        ? Utility.screenHeight * 0.24
        : Utility.screenHeight * 0.2,
    height:
      Platform.OS == 'android'
        ? Utility.screenHeight * 0.4
        : Utility.screenHeight * 0.42,
    alignItems: 'center',
    width: Utility.screenWidth,
  },
  btnClose: {
    position: 'absolute',
    top:
      Platform.OS == 'ios'
        ? -(Utility.screenHeight * 0.4)
        : -(Utility.screenHeight * 0.35),
    left: 15,
  },
  btnSave: {
    // position: 'absolute',
    // top: Platform.OS == 'ios' ? -(Utility.screenHeight * 0.4) : -(Utility.screenHeight * 0.35),
    // right: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.colorPrimary,
    // backgroundColor: "#FFFFFF",
  },
  btnSave_disabled: {
    // position: 'absolute',
    // top: Platform.OS == 'ios' ? -(Utility.screenHeight * 0.4) : -(Utility.screenHeight * 0.35),
    // right: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: '#CCCCCC',
    // backgroundColor: "#FFFFFF",
  },

  icoClose: {width: 54, height: 22, color: '#9345A3'},

  bottomGroup: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  btnBeginLiveStreamAndroid: {
    position: 'absolute',
    alignSelf: 'center',
    top: Utility.screenHeight * 0.8,
    borderRadius: 10,
    zIndex: 10,
  },
  btnBeginLiveStreamIos: {
    position: 'absolute',
    alignSelf: 'center',
    top: Utility.screenHeight * 0.9,
    borderRadius: 10,
    zIndex: 10,
  },
  beginLiveStreamText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  backArrowContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: colors.colorPrimary,
  },
});

export default styles;
