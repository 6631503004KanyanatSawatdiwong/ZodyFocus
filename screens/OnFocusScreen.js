import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet, 
  Dimensions, Animated, Alert, TouchableWithoutFeedback 
} from 'react-native';
import MusicScreen from './MusicScreen';
import EndFocusScreen from './EndFocusScreen';
import { ref, get, onValue } from 'firebase/database';
import { database } from '../firebase/firebaseConfig';
import { auth } from '../firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

// Add this mapping object at the top of the file, after imports
const alienImages = {
  purpleAlien: require('../assets/AlienCompanion/purpleAlien.png'),
  orangeAlien: require('../assets/AlienCompanion/orangeAlien.png'),
  pinkAlien: require('../assets/AlienCompanion/pinkAlien.png')
};

// Add character mapping
const characters = [
  { id: '0', image: require('../assets/Character/astronaut.png') },
  { id: '1', image: require('../assets/Character/girlAstronaut.png') },
];

export default function OnFocusScreen({ route, navigation }) {
  const { selectedTime, focusName, userId, startTime: initialStartTime, currentStar } = route.params;
  const [timeLeft, setTimeLeft] = useState(selectedTime * 60); // Convert minutes to seconds
  const [isMusicModalVisible, setMusicModalVisible] = useState(false); 
  const [isEndSessionModalVisible, setEndSessionModalVisible] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState(null);
  const [startTime, setStartTime] = useState(initialStartTime);
  const [activeAliens, setActiveAliens] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalPausedTime, setTotalPausedTime] = useState(0);

  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const moonPosition = useRef(new Animated.Value(width + 500)).current;
  const astronautRotation = useRef(new Animated.Value(0)).current;
  const astronautPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const alienAnimations = useRef([]).current;

  // Fetch user's selected character
  useEffect(() => {
    const fetchUserCharacter = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;

        const userRef = ref(database, `users/${userId}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val() || {};
        
        if (userData.character !== undefined) {
          setSelectedCharacter(userData.character);
        }
      } catch (error) {
        console.error('Error fetching user character:', error);
      }
    };

    fetchUserCharacter();
  }, []);

  // Determine which aliens to show based on currentStar
  useEffect(() => {
    const fetchAndSetActiveAliens = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) return;
  
        const userRef = ref(database, `users/${userId}`);
        const userSnapshot = await get(userRef);
        const userData = userSnapshot.val() || {};
        const unlocked = userData.unlockedAliens || {};
  
        const aliens = [];
  
        // Show aliens based on what's unlocked, regardless of currentStar
        if (unlocked.orangeAlien) {
          aliens.push('orangeAlien');
        }
  
        if (unlocked.pinkAlien) {
          aliens.push('pinkAlien');
        }
  
        if (unlocked.purpleAlien) {
          aliens.push('purpleAlien');
        }
  
        setActiveAliens(aliens);
  
        // Initialize animation values for newly active aliens
        aliens.forEach((_, index) => {
          if (!alienAnimations[index]) {
            alienAnimations[index] = new Animated.Value(0);
            startFloatingAnimation(index);
          }
        });
      } catch (error) {
        console.error('Error fetching unlocked aliens:', error);
      }
    };
  
    fetchAndSetActiveAliens();
  }, [currentStar]);  

  const startFloatingAnimation = (index) => {
    const randomDelay = Math.random() * 1000;
    setTimeout(() => {
      if (isRunning) {  // Only start animation if running
        Animated.loop(
          Animated.sequence([
            Animated.timing(alienAnimations[index], {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(alienAnimations[index], {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    }, randomDelay);
  };

  // Update alien animations when running state changes
  useEffect(() => {
    if (isRunning) {
      // Resume animations for all active aliens
      activeAliens.forEach((_, index) => {
        if (alienAnimations[index]) {
          startFloatingAnimation(index);
        }
      });
    } else {
      // Stop animations for all active aliens
      activeAliens.forEach((_, index) => {
        if (alienAnimations[index]) {
          alienAnimations[index].stopAnimation();
        }
      });
    }
  }, [isRunning]);

  // Floating animation for astronaut
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -15,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      floatAnim.setValue(0);
    }
  }, [isRunning]);

  // Timer effect
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && isRunning) {
        const fullDuration = selectedTime * 60;
        handleSessionComplete(fullDuration);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Fetch default playlist when screen loads
  useEffect(() => {
    const fetchDefaultPlaylist = async () => {
      try {
        const playlistsRef = ref(database, 'playlists');
        onValue(playlistsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Get the first playlist
            const firstPlaylistId = Object.keys(data)[0];
            const firstPlaylist = {
              id: firstPlaylistId,
              ...data[firstPlaylistId],
              fromPlaylistScreen: false // Mark as default playlist
            };
            setSelectedPlaylist(firstPlaylist);
          }
        });
      } catch (error) {
        console.error('Error fetching default playlist:', error);
      }
    };

    if (!selectedPlaylist) {
      fetchDefaultPlaylist();
    }
  }, []);

  const handleScreenPress = () => {
    if (isPaused) {
      // Resume animation sequence
      Animated.parallel([
        // Moon moves from center to left (adjusted to ensure complete exit)
        Animated.timing(moonPosition, {
          toValue: -500,
          duration: 1000,
          useNativeDriver: true,
        }),
        // Astronaut rotates back
        Animated.timing(astronautRotation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        // Astronaut moves back to original position
        Animated.timing(astronautPosition, {
          toValue: { x: 0, y: 0 },
          duration: 1000,
          useNativeDriver: true,
        }),
        // Animate both aliens back to original position
        ...activeAliens.map((_, index) => 
          Animated.timing(alienAnimations[index], {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          })
        ),
      ]).start(() => {
        setIsPaused(false);
        setIsRunning(true);
        const pauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
        setStartTime(prevStartTime => prevStartTime + (pauseDuration * 1000));
      });
    } else {
      // Pause animation sequence
      // First set moon position to right side (adjusted to ensure complete entry)
      moonPosition.setValue(width + 500);
      
      Animated.parallel([
        // Moon moves from right to center
        Animated.timing(moonPosition, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        // Astronaut rotates
        Animated.timing(astronautRotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        // Astronaut moves down to moon
        Animated.timing(astronautPosition, {
          toValue: { x: 0, y: 50 },
          duration: 1000,
          useNativeDriver: true,
        }),
        // Animate both aliens to their paused positions
        ...activeAliens.map((_, index) => 
          Animated.timing(alienAnimations[index], {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          })
        ),
      ]).start(() => {
        setIsPaused(true);
        setIsRunning(false);
        setPauseStartTime(Date.now());
      });
    }
  };

  // Interpolate rotation for astronaut
  const astronautRotate = astronautRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSessionComplete = (actualDuration) => {
    const actualDurationMinutes = Math.ceil(actualDuration / 60);
    navigation.navigate('SummaryFocusScreen', { 
      selectedTime: actualDurationMinutes,
      date: new Date().toLocaleDateString(),
      focusName,
      userId,
      startTime,
      actualDuration
    });
  };

  const handleEndSession = () => {
    setEndSessionModalVisible(false);
    setIsRunning(false);
    const actualDuration = Math.floor((Date.now() - startTime) / 1000);
    handleSessionComplete(actualDuration);
  };

  const getOrangeAlienPosition = () => {
    return {
      transform: [
        {
          translateY: alienAnimations[0].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -20],
          }),
        },
      ],
      left: width * 0.45 - 160, // Position to the left of astronaut
      top: height * 0.4,
    };
  };

  const getPinkAlienPosition = () => {
    return {
      transform: [
        {
          translateY: alienAnimations[1].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -20],
          }),
        },
      ],
      left: width * 0.8, // Position to the right of astronaut
      top: height * 0.5,
    };
  };

  const getPurpleAlienPosition = () => {
    return {
      transform: [
        {
          translateY: alienAnimations[2].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -20],
          }),
        },
      ],
      left: width * 0.05, // Position to the left of astronaut
      top: height * 0.65,
    };
  };

  const handleMusicPress = () => {
    setMusicModalVisible(true);
  };

  const handlePlaylistPress = () => {
    // Just hide the modal and navigate
    setMusicModalVisible(false);
    navigation.navigate('PlaylistScreen', {
      onReturn: (selectedPlaylist) => {
        if (selectedPlaylist) {
          // Mark playlist as coming from PlaylistScreen
          setSelectedPlaylist({
            ...selectedPlaylist,
            fromPlaylistScreen: true
          });
        }
        // Show the modal again when returning
        setMusicModalVisible(true);
      }
    });
  };

  // Add this effect to handle navigation state
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      // Hide modal when leaving the screen
      setMusicModalVisible(false);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.background}>
      <TouchableOpacity 
        activeOpacity={1} 
        style={styles.touchableArea} 
        onPress={handleScreenPress}
      >
        <ImageBackground source={require('../assets/background/space-background.png')} style={styles.backgroundImage}>
          <View style={styles.focusHeader}>
            <TouchableOpacity onPress={handleMusicPress}>
              <Image source={require('../assets/images/musicIcon.png')} style={styles.iconImage} />
            </TouchableOpacity>
            <Text style={styles.title}>{formatTime(timeLeft)}</Text>
            <TouchableOpacity onPress={() => setEndSessionModalVisible(true)}>
              <Image source={require('../assets/images/checkIcon.png')} style={styles.iconImage} />
            </TouchableOpacity>
          </View>

          <View style={styles.container}>
            {/* Moon image */}
            <Animated.View style={[
              styles.moonContainer,
              {
                transform: [{ translateX: moonPosition }],
              }
            ]}>
              <Image source={require('../assets/planets/moon.png')} style={styles.moonImage} />
            </Animated.View>

            {/* Active Alien Companions */}
            {activeAliens.map((alien, index) => (
              <Animated.View
                key={`${alien}-${index}`}
                style={[
                  styles.alienContainer,
                  alien === 'orangeAlien' && styles.orangeAlienContainer,
                  alien === 'orangeAlien' && getOrangeAlienPosition(),
                  alien === 'pinkAlien' && getPinkAlienPosition(), 
                  alien === 'purpleAlien' && styles.purpleAlienContainer,
                  alien === 'purpleAlien' && getPurpleAlienPosition(),
                ]}
              >
                <Image
                  source={alienImages[alien]}
                  style={[
                    styles.alienImage,
                    alien === 'orangeAlien' && styles.orangeAlienImage,
                    alien === 'purpleAlien' && styles.purpleAlienImage,
                  ]}
                />
              </Animated.View>
            ))}

            {/* Character with combined animations */}
            <Animated.View style={[
              styles.characterContainer,
              {
                transform: [
                  { translateY: floatAnim },
                  { translateX: astronautPosition.x },
                  { translateY: astronautPosition.y },
                  { rotate: astronautRotate }
                ]
              }
            ]}>
              <Image source={characters[selectedCharacter].image} style={styles.characterImage} />
            </Animated.View>

            {isPaused && (
              <View style={styles.pauseOverlay}>
                <Text style={styles.pauseText}>Session Paused</Text>
                <Text style={styles.pauseSubText}>Tap to resume</Text>
              </View>
            )}
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {/* Modals outside of touchable area */}
      <MusicScreen 
        visible={isMusicModalVisible} 
        onClose={() => setMusicModalVisible(false)}
        onPlaylistPress={handlePlaylistPress}
        playlist={selectedPlaylist}
      />
      <EndFocusScreen
        visible={isEndSessionModalVisible}
        onClose={() => setEndSessionModalVisible(false)}
        onEndSession={handleEndSession}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  touchableArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusHeader: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  moonContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 100,
    width: 200,
    height: 200,
  },
  moonImage: {
    width: 500,
    height: 500,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 56,
    color: 'white',
  },
  iconImage: {
    width: 45,
    height: 45,
    borderRadius: 100,
  },
  alienContainer: {
    position: 'absolute',
    width: width * 0.15,
    height: width * 0.15,
  },
  orangeAlienContainer: {
    width: width * 0.25,
    height: width * 0.25,
  },
  alienImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  orangeAlienImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  purpleAlienContainer: {
    width: width * 0.45,
    height: width * 0.45,
  },
  purpleAlienImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pauseText: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
  },
  pauseSubText: {
    fontSize: 18,
    color: 'white',
  },
  characterContainer: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  characterImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});