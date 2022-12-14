import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RTCView } from 'react-native-connectycube';
import { CallService } from '../../services';
import CallingLoader from './CallingLoader';

export default ({ streams }) => {
  debugger;
  const RTCViewRendered = ({ userId, stream }) => {
    if (stream) {
      return (
        <RTCView
          objectFit="cover"
          style={styles.blackView}
          key={userId}
          streamURL={stream.toURL()}
        />
      );
    }

    return (
      <View style={styles.blackView}>
        {/* <CallingLoader name={CallService.getUserById(userId, 'name')} /> */}
      </View>
    );
  };

  const streamsCount = streams.length;
  let RTCListView = null;

  switch (streamsCount) {
    case 1:
      RTCListView = (
        <View style={styles.videoGrid}>
          <RTCViewRendered
            userId={streams[0].userId}
            stream={streams[0].stream}
          />
        </View>
      );
      break;

    case 2:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.videoGrid}>
            <RTCViewRendered
              userId={streams[0].userId}
              stream={streams[0].stream}
            />
          </View>
          <View style={styles.videoGrid}>
            <RTCViewRendered
              userId={streams[1].userId}
              stream={streams[1].stream}
            />
          </View>
        </View>
      );
      break;

    case 3:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[0].userId}
                stream={streams[0].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[1].userId}
                stream={streams[1].stream}
              />
            </View>
          </View>
          <View style={styles.videoGrid}>
            <RTCViewRendered
              userId={streams[2].userId}
              stream={streams[2].stream}
            />
          </View>
        </View>
      );
      break;

    case 4:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[0].userId}
                stream={streams[0].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[1].userId}
                stream={streams[1].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[2].userId}
                stream={streams[2].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[3].userId}
                stream={streams[3].stream}
              />
            </View>
          </View>
        </View>
      );
      break;

    case 5:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[0].userId}
                stream={streams[0].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[1].userId}
                stream={streams[1].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[2].userId}
                stream={streams[2].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[3].userId}
                stream={streams[3].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[4].userId}
                stream={streams[4].stream}
              />
            </View>
          </View>
        </View>
      );
      break;
    case 6:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[0].userId}
                stream={streams[0].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[1].userId}
                stream={streams[1].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[2].userId}
                stream={streams[2].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[3].userId}
                stream={streams[3].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[4].userId}
                stream={streams[4].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[5].userId}
                stream={streams[5].stream}
              />
            </View>
          </View>
        </View>
      );
      break;

    case 7:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[0].userId}
                stream={streams[0].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[1].userId}
                stream={streams[1].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[2].userId}
                stream={streams[2].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[3].userId}
                stream={streams[3].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[4].userId}
                stream={streams[4].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[5].userId}
                stream={streams[5].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[6].userId}
                stream={streams[6].stream}
              />
            </View>
          </View>
        </View>
      );
      break;

    case 8:
      RTCListView = (
        <View style={styles.inColumn}>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[0].userId}
                stream={streams[0].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[1].userId}
                stream={streams[1].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[2].userId}
                stream={streams[2].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[3].userId}
                stream={streams[3].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[4].userId}
                stream={streams[4].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[5].userId}
                stream={streams[5].stream}
              />
            </View>
          </View>
          <View style={styles.inRow}>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[6].userId}
                stream={streams[6].stream}
              />
            </View>
            <View style={styles.videoGrid}>
              <RTCViewRendered
                userId={streams[7].userId}
                stream={streams[7].stream}
              />
            </View>
          </View>
        </View>
      );
      break;

    default:
      break;
  }

  return <View style={styles.blackView}>
    {RTCListView}
  </View>;
};

const styles = StyleSheet.create({
  blackView: {
    flex: 1,
    backgroundColor: 'black',
  },
  inColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  inRow: {
    flex: 1,
    flexDirection: 'row',
  },
  videoGrid: {
    backgroundColor: '#ffffff',
    width: '50%',
    padding: 5
  }
});
