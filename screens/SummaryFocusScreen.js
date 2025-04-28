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
    if (!focusSessions || focusSessions.length === 0) {
      return { currentStreak: 0 };
    }

    // Get today's date string (Thailand time)
    const now = new Date();
    const todayString = now.toISOString().split('T')[0];
    
    let currentStreak = 0;
    let currentDate = new Date(todayString);
    let expectedDate = currentDate;
    
    // Since sessions are ordered with newest first, we can iterate directly
    for (let i = 0; i < focusSessions.length; i++) {
      const sessionDate = new Date(focusSessions[i].createdAt);
      const sessionDateString = sessionDate.toISOString().split('T')[0];
      
      // If this is the first session we're checking
      if (i === 0) {
        // If it's from today, start the streak
        if (sessionDateString === todayString) {
          currentStreak = 1;
        }
        expectedDate.setDate(expectedDate.getDate() - 1);
        continue;
      }
      
      // For subsequent sessions, check if they're on the expected previous day
      const expectedDateString = expectedDate.toISOString().split('T')[0];
      
      if (sessionDateString === expectedDateString) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        // Break the streak if we miss a day
        break;
      }
    }

    return { currentStreak };
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

      // Add Thailand time offset (UTC+7)
      const thailandOffset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
      const now = new Date();
      const nowThailand = new Date(now.getTime() + thailandOffset);

      // Create session data with Thailand time
      const sessionData = {
        focusName,
        duration: formattedDuration,
        createdAt: nowThailand.toISOString(),
        completedAt: nowThailand.toISOString()
      };

      // Get existing focus sessions or initialize empty array
      const focusSessions = userData.focusSessions || [];
      
      // Add new session to the beginning of the array
      focusSessions.unshift(sessionData);

      const selectedTimeInSeconds = selectedTime * 60;
      const isFullSession = actualDuration >= selectedTimeInSeconds;

      const currentStar = isFullSession ? ((userData.currentStar || 0) + 1) : (userData.currentStar || 0);

      // Calculate streaks with the updated focus sessions
      const streakData = calculateStreaks(focusSessions);

      // Update only the necessary fields in the database
      await update(userRef, {
        focusSessions,
        currentStar,
        streaks: streakData
      });

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
