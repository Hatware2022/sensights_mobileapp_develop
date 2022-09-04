import {Platform, ToastAndroid} from 'react-native';
import Toast from 'react-native-simple-toast';
import ConnectyCube from 'react-native-connectycube';
import InCallManager from 'react-native-incall-manager';
import Sound from 'react-native-sound';
import {users, NO_ASNWER_TIMER} from '../config';
import customEventEmiter, {CUSTOM_EVENTS} from './customEvents';
import {getLocalProfile} from '../../utils/fetcher';
import {EventRegister} from 'react-native-event-listeners';

export default class CallService {
  static MEDIA_OPTIONS = {audio: true, video: {facingMode: 'user'}};
  static CURRENT_USER = null;

  _session = null;
  mediaDevices = [];
  _answerUserTimers = {};
  participantIds = [];

  outgoingCall = new Sound(require('../assets/sounds/dialing.mp3'));
  incomingCall = new Sound(require('../assets/sounds/calling.mp3'));
  endCall = new Sound(require('../assets/sounds/end_call.mp3'));

  onSystemMessage = (msg, showInomingCallModal, hideInomingCallModal) => {
    const {extension, userId} = msg;
    if (extension.callStart) {
      const {participantIds, janusRoomId} = extension;
      let oponentIds = participantIds.split(',').map(user_id => +user_id);
      oponentIds.push(+userId);

      oponentIds = oponentIds.filter(
        user_id => user_id !== CallService.CURRENT_USER.id,
      );
      if (this.janusRoomId) {
        return this.sendRejectCallMessage(
          [...oponentIds, userId],
          janusRoomId,
          true,
        );
      }

      this.participantIds = oponentIds;
      this.janusRoomId = janusRoomId;
      this.initiatorID = userId;
      showInomingCallModal();
    } else if (extension.callRejected) {
      const {janusRoomId} = extension;
      if (this.janusRoomId === janusRoomId) {
        const {busy} = extension;
        this.processOnRejectCallListener(this._session, userId, {busy});
      }
    } else if (extension.callEnd) {
      const {janusRoomId} = extension;
      if (this.janusRoomId === janusRoomId) {
        hideInomingCallModal();
        this.processOnStopCallListener(userId, this.initiatorID);
      }
    }
  };

  joinConf = (item, currentMeetingRoomUser) => {
    this._session = ConnectyCube.videochatconference.createNewSession({});

    return this._session.getUserMedia(CallService.MEDIA_OPTIONS).then(
      stream => {
        this._session.join(
          item.connectyCubeMeetingId,
          currentMeetingRoomUser.callerId,
          currentMeetingRoomUser.userName,
        );

        return stream;
      },
      error => {
        //  console.log('[Get user media error]', error, this.mediaParam);
        if (!retry) {
          this.mediaParams.video = false;
          return this.joinConf(this.janusRoomId, true);
        }
      },
    );
  };

  startCall = (item, currentMeetingRoomUser) => {
    const opponents = [];
    const ids = item.meetingUsers;
    ids.forEach(id => {
      if (id?.callerId != currentMeetingRoomUser?.callerId) {
        opponents.push(id.callerId);
      }
    });

    this.participantIds = opponents;
    this.janusRoomId = ids.connectyCubeMeetingId;
    this.sendIncomingCallSystemMessage(ids);
    this.playSound('outgoing');
    this.initiatorID = currentMeetingRoomUser.callerId; // '5893783';
    // this.startNoAnswerTimers(this.participantIds);
    this.setMediaDevices();
    return this.joinConf(item, currentMeetingRoomUser);
  };

  stopCall = () => {
    this.stopSounds();

    if (!this.isGuestMode) {
      this.sendEndCallMessage(
        [...this.participantIds, this.initiatorID],
        this.janusRoomId,
      );
    }
    debugger;
    if (this._session) {
      this._session.leave();
      this.playSound('end');
      debugger;
      ConnectyCube.videochatconference.clearSession(this._session?.id);
      this.mediaDevices = [];
      customEventEmiter.emit(CUSTOM_EVENTS.STOP_CALL_UI_RESET);
    }

    this.clearNoAnswerTimers();
    this._session = null;
    this.videoDevicesIds = [];
    this.initiatorID = 0;
    this.participantIds = [];
    this.janusRoomId = 0;
    this.currentUserName = 0;
    this.isGuestMode = 0;
  };

  acceptCall = (item, currentMeetingRoomUser) => {
    this.stopSounds();
    this.setMediaDevices();
    const opponents = [];
    const ids = item.meetingUsers;
    ids.forEach(id => {
      if (id?.callerId != currentMeetingRoomUser?.callerId) {
        opponents.push(id.callerId);
      }
    });

    this.participantIds = opponents;
    this.janusRoomId = currentMeetingRoomUser?.meetingRoomId;
    this._session = ConnectyCube.videochatconference.createNewSession();
    return this._session
      .getUserMedia(CallService.MEDIA_OPTIONS)
      .then(stream => {
        this._session.join(
          item.connectyCubeMeetingId,
          currentMeetingRoomUser.callerId,
          currentMeetingRoomUser.userName,
        );
        return stream;
      });
  };

  rejectCall = () => {
    this.stopSounds();
    const participantIds = [this.initiatorID, ...this.participantIds];
    this.sendRejectCallMessage(participantIds, this.janusRoomId, false);
    this.stopCall();
  };

  processOnRemoteStreamListener = () => {
    return new Promise((resolve, reject) => {
      if (!this._session) {
        reject();
      } else {
        resolve();
      }
    });
  };

  processOnStopCallListener(userId, isInitiator) {
    return new Promise((resolve, reject) => {
      this.stopSounds();

      if (!this._session) {
        reject();
      } else {
        const message = `stopped the call`;

        this.showToast(message);

        resolve();
      }
    });
  }

  processOnRejectCallListener(session, userId, extension = {}) {
    return new Promise((resolve, reject) => {
      if (userId === session.currentUserID) {
        this._session = null;
        this.showToast('You have rejected the call on other side');
        reject();
      } else {
        const message = `user is busy`;

        this.showToast(message);
        resolve();
      }
    });
  }

  processOnAcceptCallListener(session, userId, displayName) {
    this.stopSounds();

    const infoText = `other accepted the call`;
    this.showToast(infoText);
    this.clearNoAnswerTimers(userId);
  }

  sendIncomingCallSystemMessage = participantIds => {
    const msg = {
      extension: {
        callStart: '1',
        janusRoomId: this.janusRoomId,
        participantIds: participantIds.join(','),
      },
    };
    return participantIds.map(user_id =>
      ConnectyCube.chat.sendSystemMessage(user_id, msg),
    );
  };

  sendEndCallMessage = (participantIds, janusRoomId) => {
    const msg = {
      extension: {
        callEnd: '1',
        janusRoomId,
      },
    };
    return participantIds.map(user_id =>
      ConnectyCube.chat.sendSystemMessage(user_id, msg),
    );
  };

  sendRejectCallMessage = (participantIds, janusRoomId, isBusy) => {
    const msg = {
      extension: {
        callRejected: '1',
        janusRoomId,
        busy: !!isBusy,
      },
    };
    return participantIds.map(user_id =>
      ConnectyCube.chat.sendSystemMessage(user_id, msg),
    );
  };

  getParticipantIds = () => {
    return this.participantIds;
  };

  getInitiatorName = () => {
    const user = users.find(user => user.id == this.initiatorID);
    return user.name;
  };

  showToast = text => {
    const commonToast = Platform.OS === 'android' ? ToastAndroid : Toast;
    commonToast.showWithGravity(text, Toast.LONG, Toast.TOP);
  };

  setMediaDevices() {
    return ConnectyCube.videochatconference
      .getMediaDevices()
      .then(mediaDevices => {
        this.mediaDevices = mediaDevices;
      });
  }

  _getUniqueRoomId() {
    return ConnectyCube.chat.helpers.getBsonObjectId();
  }

  playSound = type => {
    switch (type) {
      case 'outgoing':
        this.outgoingCall.setNumberOfLoops(-1);
        this.outgoingCall.play();
        break;
      case 'incoming':
        this.incomingCall.setNumberOfLoops(-1);
        this.incomingCall.play();
        break;
      case 'end':
        this.endCall.play();
        break;

      default:
        break;
    }
  };

  stopSounds = () => {
    if (this.incomingCall.isPlaying()) {
      this.incomingCall.pause();
    }
    if (this.outgoingCall.isPlaying()) {
      this.outgoingCall.pause();
    }
  };

  isAudioMuted = () => this._session?.isAudioMuted();
  isVideoMuted = () => this._session?.isVideoMuted();

  setAudioMute = () => {
    const isAudioMuted = this.isAudioMuted();

    if (isAudioMuted) {
      this._session.unmuteAudio();
    } else {
      this._session.muteAudio();
    }

    return !isAudioMuted;
  };

  setVideoMute = () => {
    const isVideoMuted = this.isVideoMuted();

    if (isVideoMuted) {
      this._session.unmuteVideo();
    } else {
      this._session.muteVideo();
    }

    return !isVideoMuted;
  };

  setSpeakerphoneOn = flag => InCallManager.setSpeakerphoneOn(flag);

  switchCamera = localStream => {
    localStream.getVideoTracks().forEach(track => track._switchCamera());
  };

  startNoAnswerTimers(participantIds) {
    participantIds.forEach(user_id => {
      this._answerUserTimers[user_id] = setTimeout(
        () => this.onUserNotAnswerListener(user_id),
        NO_ASNWER_TIMER,
      );
    });
  }

  clearNoAnswerTimers(user_id) {
    if (user_id) {
      clearTimeout(this._answerUserTimers[user_id]);
      return delete this._answerUserTimers[user_id];
    }
    Object.values(this._answerUserTimers).forEach(timerId =>
      clearTimeout(timerId),
    );
    this._answerUserTimers = {};
  }

  onUserNotAnswerListener = userId => {
    if (!this._session) {
      return false;
    }

    const infoText = `did not answer`;

    this.showToast(infoText);
    this.sendEndCallMessage([userId], this.janusRoomId);
    this.stopCall(userId);
  };
}
