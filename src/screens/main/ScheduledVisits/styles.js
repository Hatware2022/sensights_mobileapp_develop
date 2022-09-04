import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';
import colors from '../../../theme/colors';
export default (styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  Subcontainer: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: 'space-between',
  },
  content: {
    height: 30,
  },
  header: {
    height: 20,
  },
  InActiveHeader: {
    fontSize: 20,
    color: colors.colorPrimary,
  },
  ActiveHeader: {
    fontSize: 20,
    color: colors.white,
  },
  iconContainer: {
    width: 20,
    height: 20,
  },
  activeimg: {
    height: '100%',
    width: '100%',
    tintColor: colors.white,
    transform: [{rotate: '270deg'}],
  },
  imgStyles: {
    height: '100%',
    width: '100%',
    tintColor: colors.colorPrimary,
    transform: [{rotate: '90deg'}],
  },
  ActiveHeaderContainer: {
    backgroundColor: colors.colorPrimary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  InActiveHeaderContainer: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.colorPrimary,
    paddingHorizontal: 20,
  },
  dotContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
  },
  DotTitleContainer: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingStart: 20,
    width: '100%',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingBottom: 30,
    paddingEnd: 20,
  },
  DotTitle: {
    fontSize: 22,
    // lineHeight: 13,
    color: colors.colorPrimary,
    fontFamily: 'Montserrat-Regular',
  },

  itemContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 20,
    padding: 8,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  visitDetailStyle: {
    color: theme.colors.black,
    fontFamily: theme.fonts.SFProRegular,
    fontSize: 18,
    // alignSelf: 'center',
    fontWeight: 'bold',
  },
  meetingDateStyle: {
    color: colors.black,
    fontFamily: theme.fonts.SFProRegular,
    fontSize: 15,
    marginTop: 10,
  },
  scheduleCallButton: {
    height: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleBtn: {
    backgroundColor: theme.colors.colorPrimary,
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    // color: theme.colors.white,
    fontFamily: theme.fonts.SFProRegular,
    fontSize: 18,
    flexGrow: 1,
    alignSelf: 'center',
    marginVertical: 25,
    paddingHorizontal: 10,
    borderWidth: 1,
    padding: 5,
    borderRadius: 5,
  },
}));
