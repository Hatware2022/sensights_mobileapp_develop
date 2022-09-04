import {StyleSheet} from 'react-native';
import {theme} from '../../../../theme';
import colors from '../../../../theme/colors';
import fonts from '../../../../theme/fonts';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.colorPrimary,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  subContainer: {
    flex: 1,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
  },
  scrollViewStyle: {width: '100%', paddingHorizontal: 20, marginBottom: 15},
  dateContainer: {
    borderRadius: 10,
    paddingEnd: 10,
    backgroundColor: theme.colors.grey_shade_4,
    marginTop: 10,
  },
  placeholderStyle: {color: '#BBB', fontSize: 20},
  dateIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropDownContainer: {
    width: '100%',
    borderRadius: 10,
    minHeight: 50,
    backgroundColor: theme.colors.grey_shade_4,
    marginTop: 10,
    paddingEnd: 10,
  },
  followupTextStyle: {
    width: '100%',
    fontSize: 17,
    fontFamily: fonts.SFProRegular,
    marginTop: 10,
    height: 50,
    paddingStart: 10,
  },
  scheduleBtn: {
    height: 50,
    width: '90%',
    backgroundColor: theme.colors.colorPrimary,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  InvitedUserFlatlistContainer: {
    height: 150,
    backgroundColor: theme.colors.grey_shade_4,
    borderRadius: 10,
    marginTop: 10,
  },
  inviteBtn: {
    height: 30,
    backgroundColor: '#73C1DE',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 10,
    minHeight: 50,
  },

  modalContanier: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#d3d3d3C2',
  },
  modalBtnContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  modalBtn: {
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
  imageStyle: {
    height: 50,
    width: 50,
    borderRadius: 25,
    marginEnd: 10,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(191, 232, 255, 1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00AEEF',
    paddingVertical: 15,
    paddingStart: 10,
    marginHorizontal: 10,
  },
  unselectedRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingStart: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: colors.grey_shade_4,
    marginHorizontal: 10,
  },
  StatusText: {
    fontSize: 16,
    color: colors.colorPrimary,
    fontFamily: theme.fonts.SFProRegular,
    textAlignVertical: 'center',
  },
  onlineStatusText: {
    fontSize: 16,
    color: colors.colorPrimary,
    fontFamily: theme.fonts.SFProMedium,
    textAlignVertical: 'center',
  },
  offlineStatusText: {
    fontSize: 16,
    color: colors.red_shade_1,
    fontFamily: theme.fonts.SFProMedium,
    textAlignVertical: 'center',
  },
  onlineOfflineStatusContainer: {
    flexDirection: 'row',
    fontSize: 16,
    color: colors.colorPrimary,
    fontFamily: theme.fonts.SFProRegular,
    alignItems: 'center',
  },
  headerContainer: {
    width: '100%',
    backgroundColor: '#C5C7CD',
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectContactStyle: {
    fontSize: 20,
    fontFamily: fonts.SFProRegular,
  },
  genrateContainer: {
    borderRadius: 10,
    paddingLeft: 7,
    paddingRight: 7,
    marginTop: 10,
    height: 50,
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.grey_shade_4,
  },
  genrateButtonContainer: {
    borderRadius: 10,
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.grey_shade_1,
  },
  genrateText: {
    fontSize: 16,
    paddingHorizontal: 10,
    color: theme.colors.black,
    fontFamily: theme.fonts.SFProRegular,
  },
  codeTextStyle: {
    fontSize: 17,
    paddingStart: 5,
    color: theme.colors.black,
    fontFamily: theme.fonts.SFProMedium,
  },

  invitedUserTextStyle: {
    fontSize: 17,
    fontFamily: theme.fonts.SFProRegular,
    color: theme.colors.black,
    paddingVertical: 2,
  },
  invitedUserListItemStyle: {
    marginVertical: 5,
    backgroundColor: theme.colors.white,
    paddingStart: 5,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 0.7,
    borderColor: theme.colors.grey_shade_1,
  },

  flatlistContainer: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  emptyInvitedUserList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyInvitedUserListText: {
    fontSize: 16,
    fontFamily: theme.fonts.SFProRegular,
    color: theme.colors.black,
  },
  itemTitleStyle: {
    fontWeight: 'bold',
    fontSize: 17,
    marginTop: 20,
  },
});
