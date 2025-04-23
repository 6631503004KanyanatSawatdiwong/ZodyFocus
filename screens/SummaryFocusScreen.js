import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { database, ref, onValue, set, get, update } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function SummaryFocusScreen({ route, navigation }) {
  const { selectedTime, date, focusName, userId, startTime, actualDuration } = route.params;
  const [currentStar, setCurrentStar] = useState(0);

  useEffect(() => {
    const fetchCurrentStar = async () => {
      try {
        if (!userId) {
          navigation.navigate('CharacterScreen');
          return;
        }

        const userRef = ref(database, `users/${userId}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setCurrentStar(data.currentStar || 0);
          }
        });
      } catch (error) {
        console.error('Error fetching current star:', error);
      }
    };

    fetchCurrentStar();
  }, [navigation, userId]);

  // Format time into "X minutes" or "X:XX" format for display
  const formatTime = (timeInMinutes) => {
    const minutes = Math.floor(timeInMinutes);
    const seconds = Math.round((timeInMinutes - minutes) * 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Format duration into HH:MM:SS format for database
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Calculate streaks based on focus sessions
  const calculateStreaks = (focusSessions) => {
    // Base case: no sessions = no streak
    if (!focusSessions || focusSessions.length === 0) {
      return {
        currentStreak: 0
      };
    }

    // Sort sessions by date (newest first)
    const sortedSessions = [...focusSessions].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Get current time in Thailand (UTC+7)
    const now = new Date(Date.now() + (7 * 60 * 60 * 1000));
    const todayMidnight = new Date(now);
    todayMidnight.setHours(0, 0, 0, 0);
    
    // Check if most recent session was today
    const mostRecentSession = new Date(sortedSessions[0].createdAt);
    if (mostRecentSession < todayMidnight) {
      return {
        currentStreak: 0
      };
    }

    // Calculate current streak
    let currentStreak = 1;
    let currentDate = new Date(mostRecentSession);
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 1; i < sortedSessions.length; i++) {
      const sessionDate = new Date(sortedSessions[i].createdAt);
      sessionDate.setHours(0, 0, 0, 0);
      
      // Check if this session is from the previous day
      const previousDate = new Date(currentDate);
      previousDate.setDate(previousDate.getDate() - 1);
      
      if (sessionDate.getTime() === previousDate.getTime()) {
        currentStreak++;
        currentDate = sessionDate;
      } else {
        break;
      }
    }

    // Return only the current streak value
    return {
      currentStreak
    };
  };

  // Function to update streaks based on existing sessions
  const updateStreaksFromSessions = async () => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val() || {};

      if (!userData.focusSessions || userData.focusSessions.length === 0) {
        console.log('No focus sessions found');
        return;
      }

      // Calculate new streaks
      const streakData = calculateStreaks(userData.focusSessions);

      // Update only the streaks in the database
      await update(userRef, { streaks: streakData });
      
      console.log('Streaks updated:', streakData);
    } catch (error) {
      console.error('Error updating streaks:', error);
    }
  };

  // Add this to your useEffect to run when component mounts
  useEffect(() => {
    updateStreaksFromSessions();
  }, []);

  const handleContinueButton = async () => {
    try {
      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val() || {};

      const formattedDuration = formatDuration(actualDuration);

      // Convert timestamps to Thailand time
      const startTimeThailand = new Date(startTime + (7 * 60 * 60 * 1000));
      const completedTimeThailand = new Date(Date.now() + (7 * 60 * 60 * 1000));

      const sessionData = {
        focusName,
        duration: formattedDuration,
        createdAt: startTimeThailand.toISOString(),
        completedAt: completedTimeThailand.toISOString()
      };

      const focusSessions = userData.focusSessions || [];
      focusSessions.push(sessionData);

      const selectedTimeInSeconds = selectedTime * 60;
      const isFullSession = actualDuration >= selectedTimeInSeconds;

      const currentStar = isFullSession ? ((userData.currentStar || 0) + 1) : (userData.currentStar || 0);

      // Calculate streaks
      const streakData = calculateStreaks(focusSessions);

      // Update user data with focusSessions, currentStar, and streaks
      const updateData = {
        ...userData,
        focusSessions,
        currentStar,
        streaks: streakData
      };

      await set(userRef, updateData);

      navigation.navigate('ToFocusScreen');
    } catch (error) {
      console.error('Error saving session:', error);
      Alert.alert('Error', 'Failed to save session data');
    }
  };  

  return (
    <ImageBackground source={require('../assets/background/space-background.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Date: {date}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.text}>You focused on {focusName}</Text>
          <Text style={styles.text}>for {formatTime(actualDuration / 60)} minutes.</Text>
          <Text style={styles.text}>The galaxy is vast! Next time, </Text>
          <Text style={styles.text}>Let's explore even more!</Text>
        </View>

        <Image source={require('../assets/images/blueFrameTop.png')} style={styles.blueFrameTop} />
        <Image source={require('../assets/images/blueFrameBottom.png')} style={styles.blueFrameBottom} />
        <Image source={require('../assets/images/star.png')} style={styles.star} />
        
        <TouchableOpacity style={styles.continueButton} onPress={handleContinueButton}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    paddingVertical: 3,
  },
  textContainer: {
    padding: 10,
    borderRadius: 10,
  },
  blueFrameTop: {
    position: 'absolute',
    top: -100,
    width: '100%',
    height: '25%',
  },
  blueFrameBottom: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '13%',
  },
  star: {
    width: 200,
    height: 200,
  },
  continueButton: {
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 10,
    alignSelf: 'center',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
    marginTop: 20,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});
