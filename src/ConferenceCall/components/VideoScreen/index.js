import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import ConnectyCube from 'react-native-connectycube';
import AwesomeAlert from 'react-native-awesome-alerts';
import RTCViewGrid from './RTCViewGrid';
import {CallService, AuthService} from '../../services';
import ToolBar from './ToolBar';

export default class VideoScreen extends React.Component {
  constructor(props) {
    super();

    this._session = null;
    this.opponentsIds = props.navigation
      .getParam('op')
      .meetingUsers.map(item => item.id);
    this.state = {
      localStream: null,
      remoteStreams: [],
      selectedUsersIds: [],
      isActiveSelect: false,
      isActiveCall: false,
      isIncomingCall: false,
      currentMeetingRoomUser: props.navigation.getParam(
        'currentMeetingRoomUser',
      ),
      // opData: props.navigation.getParam('op'),
    };
    this._setUpListeners();
  }
  componentDidMount() {
    setTimeout(() => {
      this._onPressAccept(
        this.props.navigation.getParam('op'),
        this.state.currentMeetingRoomUser,
      );
      //   this.state.currentMeetingRoomUser,)
      // CallService.acceptCall(
      //   this.props.navigation.getParam('op'),
      //   this.state.currentMeetingRoomUser,
      // ).then(stream => {
      //   console.log('streeeeeeeemmmm', stream);
      //   const participantIds = CallService.getParticipantIds();
      //   this.initRemoteStreams(participantIds);
      //   this.setLocalStream(stream);
      //   //this.setState({isActiveCall: true});
      // });
    }, 500);
  }
  componentWillUnmount() {
    CallService.stopCall();
  }

  showInomingCallModal = session => {
    this._session = session;
    this.setState({isIncomingCall: true});
  };

  hideInomingCallModal = () => {
    this.setState({isIncomingCall: false});
  };

  closeSelect = () => {
    this.setState({isActiveSelect: false});
  };

  setOnCall = () => {
    this.setState({isActiveCall: true});
  };

  initRemoteStreams = opponentsIds => {
    const emptyStreams = opponentsIds.map(userId => ({
      userId,
      stream: null,
    }));

    this.setState({remoteStreams: emptyStreams});
  };

  updateRemoteStream = (userId, stream) => {
    this.setState(({remoteStreams}) => {
      const updatedRemoteStreams = remoteStreams.map(item => {
        if (item.userId == userId) {
          return {userId, stream};
        }

        return {userId: item.userId, stream: item.stream};
      });

      return {remoteStreams: updatedRemoteStreams};
    });
  };

  removeRemoteStream = userId => {
    this.setState(({remoteStreams}) => ({
      remoteStreams: remoteStreams.filter(item => item.userId !== userId),
    }));
  };

  setLocalStream = stream => {
    this.setState({localStream: stream});
  };

  resetState = () => {
    this.setState({
      localStream: null,
      remoteStreams: [],
      selectedUsersIds: [],
      isActiveSelect: true,
      isActiveCall: false,
    });
  };

  _setUpListeners = () => {
    ConnectyCube.chat.onSystemMessageListener = this.onSystemMessage.bind(this);
    ConnectyCube.videochatconference.onParticipantLeftListener = this.onStopCallListener.bind(
      this,
    );
    ConnectyCube.videochatconference.onRemoteStreamListener = this.onRemoteStreamListener.bind(
      this,
    );
    ConnectyCube.videochatconference.onParticipantJoinedListener = this.onAcceptCallListener.bind(
      this,
    );
    ConnectyCube.videochatconference.onSlowLinkListener = this.onSlowLinkListener.bind(
      this,
    );
    ConnectyCube.videochatconference.onRemoteConnectionStateChangedListener = this.onRemoteConnectionStateChangedListener.bind(
      this,
    );
    ConnectyCube.videochatconference.onSessionConnectionStateChangedListener = this.onSessionConnectionStateChangedListener.bind(
      this,
    );
  };

  onSystemMessage = msg => {
    CallService.onSystemMessage(
      msg,
      this.showInomingCallModal,
      this.hideInomingCallModal,
    );
  };

  onStopCallListener = (session, userId, extension) => {
    const isStoppedByInitiator = session.initiatorID === userId;
    CallService.processOnStopCallListener(userId, isStoppedByInitiator)
      .then(() => {
        if (isStoppedByInitiator) {
          this.resetState();
        } else {
          this.removeRemoteStream(userId);
        }
      })
      .catch(this.hideInomingCallModal);
  };

  onRemoteStreamListener = (session, userId, stream) => {
    CallService.processOnRemoteStreamListener(userId)
      .then(() => {
        this.updateRemoteStream(userId, stream);
        this.setOnCall();
      })
      .catch(this.hideInomingCallModal);
  };

  onAcceptCallListener = (session, userId, displayName) => {
    CallService.processOnAcceptCallListener(session, userId, displayName);
  };

  onSlowLinkListener = (session, userId, uplink, nacks) => {
    console.log('[onSlowLinkListener]', userId, uplink, nacks);
  };

  onRemoteConnectionStateChangedListener = (session, userId, iceState) => {
    console.log('[onRemoteConnectionStateChangedListener]', userId, iceState);
  };

  onSessionConnectionStateChangedListener = (session, iceState) => {
    console.log('[onSessionConnectionStateChangedListener]', iceState);
  };

  _onPressAccept = (a, b) => {
    CallService.acceptCall(a, b).then(stream => {
      console.log('initStream', stream);
      const participantIds = CallService.getParticipantIds();
      this.initRemoteStreams(participantIds);
      this.setLocalStream(stream);

      // this.hideInomingCallModal();
    });
  };

  _onPressReject = () => {
    CallService.rejectCall();
    this.hideInomingCallModal();
  };

  render() {
    const {
      localStream,
      remoteStreams,
      selectedUsersIds,
      isActiveSelect,
      isActiveCall,
      isIncomingCall,
    } = this.state;
    const initiatorName = isIncomingCall
      ? CallService.getInitiatorName('name')
      : '';
    const localStreamItem = localStream
      ? [{userId: 'localStream', stream: localStream}]
      : [];
    const streams = [...remoteStreams, ...localStreamItem];

    CallService.setSpeakerphoneOn(remoteStreams.length > 0);
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        {streams && streams.length > 0 && <RTCViewGrid streams={streams} />}
        <ToolBar
          selectedUsersIds={selectedUsersIds}
          localStream={localStream}
          isActiveSelect={isActiveSelect}
          isActiveCall={isActiveCall}
          closeSelect={this.closeSelect}
          initRemoteStreams={this.initRemoteStreams}
          setLocalStream={this.setLocalStream}
          resetState={this.resetState}
          navigation={this.props.navigation}
        />
        <AwesomeAlert
          show={isIncomingCall}
          showProgress={false}
          title={`Incoming call from ${initiatorName}`}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={true}
          showCancelButton={true}
          showConfirmButton={true}
          cancelText="Reject"
          confirmText="Accept"
          cancelButtonColor="red"
          confirmButtonColor="green"
          onCancelPressed={this._onPressReject}
          onConfirmPressed={this._onPressAccept}
          onDismiss={this.hideInomingCallModal}
          alertContainerStyle={{zIndex: 1}}
          titleStyle={{fontSize: 21}}
          cancelButtonTextStyle={{fontSize: 18}}
          confirmButtonTextStyle={{fontSize: 18}}
        />
      </SafeAreaView>
    );
  }
}
