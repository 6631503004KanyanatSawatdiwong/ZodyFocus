import { StatusBar } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import React  from 'react';
import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';
import IntroScreen from './screens/IntroScreen';
import CharacterScreen from './screens/CharacterScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import ToFocusScreen from './screens/ToFocusScreen';
import OnFocusScreen from './screens/OnFocusScreen';
import MusicScreen from './screens/MusicScreen';
import PlaylistScreen from './screens/PlaylistScreen';
import EndFocusScreen from './screens/EndFocusScreen';
import SummaryFocusScreen from './screens/SummaryFocusScreen';
import UnlockScreen from './screens/UnlockScreen';
import ChangeCharacterScreen from './screens/ChangeCharacterScreen';
import AuthScreen from './screens/AuthScreen'; 
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createStackNavigator();
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Stack.Navigator initialRouteName="IntroScreen" screenOptions={{ headerShown: false}}>
          <Stack.Screen name="IntroScreen" component={IntroScreen} />
          <Stack.Screen name = "AuthScreen" component={AuthScreen} />
          <Stack.Screen name="CharacterScreen" component={CharacterScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="ToFocusScreen" component={ToFocusScreen} />
          <Stack.Screen name="OnFocusScreen" component={OnFocusScreen} />
          <Stack.Screen name="MusicScreen" component={MusicScreen} /> 
          <Stack.Screen name="PlaylistScreen" component={PlaylistScreen} options={{ headerBackTitle: 'Back'}} />
          <Stack.Screen name="EndFocusScreen" component={EndFocusScreen} />
          <Stack.Screen name="SummaryFocusScreen" component={SummaryFocusScreen} />
          <Stack.Screen name="UnlockScreen" component={UnlockScreen} />
          <Stack.Screen name="ChangeCharacterScreen" component={ChangeCharacterScreen} />
          <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}