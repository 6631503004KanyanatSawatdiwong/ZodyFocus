import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, Animated, Easing, Dimensions } from 'react-native';
import YoutubePlayer from "react-native-youtube-iframe";
import { Ionicons } from '@expo/vector-icons';
import { database } from '../firebase/config';
import { ref, onValue } from 'firebase/database';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

const MusicScreen = ({ visible, onClose, onPlaylistPress, playlist }) => {
  const [playing, setPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const spinAnimation = useRef(null);

  // Fetch songs when playlist changes
  useEffect(() => {
    if (playlist?.id) {
      fetchSongs(playlist.id);
      // Only auto-play when explicitly selecting a new playlist from PlaylistScreen
      if (playlist.fromPlaylistScreen) {
        setPlaying(true);
      }
    }
  }, [playlist]);

  const fetchSongs = async (playlistId) => {
    try {
      setLoading(true);
      const songsRef = ref(database, `playlists/${playlistId}/songs`);
      
      onValue(songsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Convert songs object to array and sort by key
          const songsArray = Object.entries(data)
            .map(([key, value]) => ({
              id: key,
              videoId: value, // In your database, the value is directly the videoId
            }))
            .sort((a, b) => a.id.localeCompare(b.id)); // Sort by song number
          setSongs(songsArray);
          setCurrentSongIndex(0); // Reset to first song when playlist changes
        } else {
          setSongs([]);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error fetching songs:", error);
        setLoading(false);
      });
    } catch (error) {
      console.error("Error in fetchSongs:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (playing) {
      spinAnimation.current = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 5000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnimation.current.start();
    } else {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
      }
    }

    return () => {
      if (spinAnimation.current) {
        spinAnimation.current.stop();
      }
    };
  }, [playing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleNext = () => {
    if (songs.length > 0) {
      setCurrentSongIndex((prev) => (prev + 1) % songs.length);
      setPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (songs.length > 0) {
      setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
      setPlaying(true);
    }
  };

  const handleStateChange = (state) => {
    if (state === "ended") {
      handleNext(); // Auto-play next song
    } else if (state === "playing") {
      setPlaying(true);
    } else if (state === "paused") {
      setPlaying(false);
    }
  };

  const handlePlaylistPress = () => {
    // Just navigate to playlist screen without modifying any state
    onPlaylistPress();
  };

  // Get current song
  const currentSong = songs[currentSongIndex] || {};

  return (
    <>
      <View style={{ height: 0, overflow: 'hidden' }}>
        <YoutubePlayer
          key={currentSong.videoId} // Force re-render when video changes
          height={200}
          play={playing}
          videoId={currentSong.videoId}
          onChangeState={handleStateChange}
          initialPlayerParams={{
            preventFullScreen: true,
            controls: false,
            modestbranding: true,
            rel: 0,
          }}
          webViewProps={{
            renderToHardwareTextureAndroid: true,
            bounces: false,
          }}
        />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.container} onStartShouldSetResponder={() => true}>
            <Text style={styles.songTitle}>{playlist?.title}</Text>

            <View style={styles.recordContainer}>
              <Animated.Image
                source={require('../assets/images/record.png')}
                style={[styles.recordImage, { transform: [{ rotate: spin }] }]}
              />
              <Animated.Image
                source={{ uri: playlist?.coverUrl }}
                style={[styles.songCover, { transform: [{ rotate: spin }] }]}
              />
            </View>

            <View style={styles.controls}>
              <TouchableOpacity onPress={handlePrevious}>
                <Ionicons name="play-skip-back" size={32} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPlaying(!playing)}>
                <Ionicons name={playing ? "pause" : "play"} size={32} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNext}>
                <Ionicons name="play-skip-forward" size={32} color="black" />
              </TouchableOpacity>
            </View>

            <View>
              <TouchableOpacity onPress={handlePlaylistPress}>
                <Text style={styles.text}>Change Playlist</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    height: '50%',
    backgroundColor: '#ffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  songTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: 'black',
    marginVertical: 15,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginVertical: 10,
  },
  text: {
    fontSize: 18,
    color: "#24A0ED",
    marginVertical: 10,
  },
  recordContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  recordImage: {
    width: width * 0.5,
    height: width * 0.5,
  },
  songCover: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'absolute',
  },
});

export default MusicScreen;