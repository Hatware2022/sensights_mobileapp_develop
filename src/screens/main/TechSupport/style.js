import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';
import colors from '../../../theme/colors';

export default (styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFEFF4',
    flex: 1,
  },

  headerContainer: {
    height: '35%',
    borderBottomWidth: 0.5,
    borderColor: colors.colorPrimary,
  },
  backArrowContainer: {
    height: '10%',
    width: '100%',
    justifyContent: 'center',
  },
  headerAbsoluteContainer: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    justifyContent: 'space-between',
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    backgroundColor: colors.white,
    marginStart: 10,
    marginTop: 15,
  },
  BackButtonTitle: {
    fontSize: 14,
    paddingVertical: 5,
    paddingHorizontal: 15,
    color: colors.colorPrimary,
    fontFamily: theme.fonts.SFProBold,
  },

  imgContainer: {
    height: '100%',
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  TechStatusContainer: {
    alignSelf: 'center',
    marginBottom: 5,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 5,
  },
  TechTextStyle: {
    fontSize: 22,
    fontFamily: theme.fonts.SFProBold,
    color: colors.black,
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  TechOnlineStatus: {
    fontSize: 17,
    fontFamily: theme.fonts.SFProRegular,
    color: colors.black,
    marginBottom: 15,
    textAlign: 'center',
    width: '100%',
  },
  TechSupportStatus: {
    fontSize: 17,
    fontFamily: theme.fonts.SFProRegular,
    color: colors.black,
    alignSelf: 'center',
  },
  contactSupportContainer: {
    height: '15%',
  },
  contactSupportText: {
    fontSize: 14,
    fontFamily: theme.fonts.SFProMedium,
    marginVertical: 12,
    marginStart: 17,
  },
  contactSupportButtonGroup: {
    flex: 1,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 17,
  },
  buttonIconStyle: {
    backgroundColor: theme.colors.toggle_color,
    borderRadius: 10,
  },

  retryContainer: {
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonTitle: {
    fontSize: 20,
    color: colors.colorPrimary,
    fontWeight: 'bold',
    paddingTop: 40,
  },
  imgStyle: {
    height: '100%',
    width: '100%',
  },
  supportHoursContainer: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingStart: 17,
    // paddingHorizontal: 17,
  },
  supportHoursText: {
    fontSize: 13,
    lineHeight: 22,
    color: '#000000',
    fontFamily: theme.fonts.SFProMedium,
  },
}));
