import React, { useState } from "react";
import {View,TextInput,Text,Alert,TouchableOpacity,StyleSheet,KeyboardAvoidingView,Platform,Image,Modal,ScrollView} from "react-native";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { database, ref, set, onValue } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const { width, height } = Dimensions.get('window');
const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsError, setTermsError] = useState(false);

  const handleAuth = async () => {
    try {
      if (!isLogin && !isChecked) {
        setTermsError(true);
        return;
      }
      setTermsError(false);
      setLoading(true);
      const auth = getAuth();

      if (isLogin) {
        // Login logic
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        console.log("UserCredential", userCredential);
        
        // Check if user has completed character setup
        const userRef = ref(database, 'users/' + userCredential.user.uid);
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val();
          if (userData && userData.character !== undefined) {
            // User has completed character setup, go to HomeScreen
            AsyncStorage.setItem('userId', userCredential.user.uid);
            navigation.navigate("HomeScreen");
          } else {
            // User hasn't completed character setup, go to CharacterScreen
            navigation.navigate("CharacterScreen");
          }
        }, {
          onlyOnce: true // Only check once
        });
      } else {
        // Register logic
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        console.log("UserCredential", userCredential);

        // Save user info to Realtime Database
        const user = userCredential.user;
        const userRef = ref(database, 'users/' + user.uid);
        await set(userRef, {
          email: user.email,
          createdAt: new Date().toISOString(),
          currentStar: 0,
          lastUnlockStar: 0,
          unlockedAliens: {},
          focusSessions: [],
          streaks: {
            currentStreak: 0,
          },
          planetBadges: {
            starletExplorer: true, // Always unlocked
            irisnovaVoyage: false,
            rosellePioneer: false,
            shimmerAdventurer: false,          
            weekendWarrior: false,          
            dreamWalker: false
          },                  
        });

        Alert.alert("Success", "Account created successfully");
        navigation.navigate("CharacterScreen");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      Alert.alert("Authentication Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      return Alert.alert("Error", "Please enter your email first.");
    }
  
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert("Reset Email Sent", "Check your email to reset your password.");
    } catch (error) {
      console.error("Reset Password Error:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{isLogin ? "Login" : "Register"}</Text>

        <Image source={require('../assets/Character/girlAstronaut.png')} style={styles.astronaut} />
        <Image source={require('../assets/images/star.png')} style={styles.smallstar}/>
        <Image source={require('../assets/images/star.png')} style={styles.bigstar}/>
        <Image source={require('../assets/AlienCompanion/orangeAlien.png')} style={styles.alienleft}/>
        <Image source={require('../assets/AlienCompanion/purpleAlien.png')} style={styles.alienright}/>

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          {!isLogin && (
            <View style={styles.termsContainer}>
              <TouchableOpacity 
                style={[styles.checkbox, isChecked && styles.checkedBox]} 
                onPress={() => {
                  setIsChecked(!isChecked);
                  setTermsError(false);
                }}
              >
                {isChecked && <FontAwesomeIcon icon={faCheck} size={12} color="white" />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                By signing up, you agree to our{" "}
                <Text 
                  style={styles.termsLink}
                  onPress={() => setShowTermsModal(true)}
                >
                  Terms of Service and Privacy Policy
                </Text>
              </Text>
            </View>
          )}
          {!isLogin && termsError && (
            <Text style={styles.errorText}>
              Please accept the Terms of Service and Privacy Policy
            </Text>
          )}

          <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={loading}>
            <Text style={styles.buttonText}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </Text>
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text onPress={() => setIsLogin(!isLogin)} style={styles.switchText}>
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </Text>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showTermsModal}
        onRequestClose={() => setShowTermsModal(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
            <ScrollView style={styles.termsScrollView}>
              <Text style={styles.termsTitle}>Terms of Service and Privacy Policy</Text>
              <Text style={styles.termsBody}>
              <Text style={styles.termsTopic}>1. Introduction</Text>
                {"\n"}Zody Focus is a space-themed focus timer app designed to help users stay productive by accumulating focus hours and unlocking new planets and companions. We are committed to respecting your privacy and ensuring transparency in how we handle your data.
                {"\n\n"}
                <Text style={styles.termsTopic}>2. Data Collection</Text>
                {"\n"}Users must sign in using their email address and set their own username and password. We collect and store your login credentials and focus statistics, such as accumulated focus time and progress (e.g., unlocked planets or achievements).
                {"\n\n"}
                <Text style={styles.termsTopic}>3. Data Usage</Text>
                {"\n"}The data we collect is used solely for saving your progress and enhancing your experience within the app (e.g., displaying your stats, progress, unlocked companions, and character customization). We do not sell, share, or use your data for third-party marketing purposes.
                {"\n\n"}
                <Text style={styles.termsTopic}>4. Data Storage</Text>
                {"\n"}All user data is securely stored using Firebase. If you wish to delete your data, please contact our team directly.
                {"\n\n"}
                <Text style={styles.termsTopic}>5. Third-Party Services</Text>
                {"\n"}Zody Focus does not use any third-party services that collect user data.
                {"\n\n"}
                <Text style={styles.termsTopic}>6. Core Features</Text>
                {"\n"}Users can start and customize their own focus timer sessions. A statistics page allows users to view their data by year, month, or day. Access to the app is restricted to logged-in users only.
                {"\n\n"}
                <Text style={styles.termsTopic}>7. Progress System</Text>
                {"\n"}Users unlock smaller planets and eventually larger ones based on accumulated focus time. Unlocking a large planet also grants users a floating space companion to accompany them during focus sessions. Additionally, users can collect achievements and customize their personal character within the app.
                {"\n\n"}
                <Text style={styles.termsTopic}>8. Notifications</Text>
                {"\n"}Zody Focus does not currently use any notification system.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  inputContainer: {
    marginTop: 70,
  },
  astronaut: {
    width: 150,
    height: 150,
    alignSelf: "center",
    marginTop: 30,
  },
  smallstar: {
    width: 20,
    height: 20,
    position: "absolute",
    top: 200,
    left: 90,
  },
  bigstar: {
    width: 50,
    height: 50,
    position: "absolute",
    top: 290,
    right: 75,
  },
  alienleft: {
    width: 60,
    height: 60,
    position: "absolute",
    top: 300,
    left: 100,
  },
  alienright: {
    width: 60,
    height: 60,
    position: "absolute",
    top: 150,
    right: 120,
  },
  input: {
    borderWidth: 1,
    marginBottom: 15,
    padding: 12,
    fontSize: 16,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#151B54",
    paddingVertical: 14,
    marginBottom: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchText: {
    textAlign: 'center',
    color: 'blue',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginBottom: 15,
  },
  forgotPassword: {
    color: "#151B54",
    textAlign: "right",
    fontSize: 14,
    textDecorationLine: "underline",
    marginBottom: 10,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#151B54',
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#151B54',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: 'black',
  },
  termsLink: {
    color: '#151B54',
    textDecorationLine: 'underline',
  },
  modalContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 25,
    paddingBottom: 30,
    height: '80%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    color: '#151B54',
    fontSize: 16,
  },
  termsScrollView: {
    marginTop: 10,
  },
  termsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  termsBody: {
    fontSize: 14,
    lineHeight: 24,
  },
  termsTopic: {
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default AuthScreen; 