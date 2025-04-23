import React, { useState, useEffect, useRef } from "react";
import { View, Text, Modal, Image, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { ref, get } from "firebase/database";
import { database } from "../firebase/firebaseConfig";
import { auth } from "../firebase/firebaseConfig";

const UnlockScreen = ({ visible, onClose, currentStar, lastUnlockStar, alienName }) => {
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;
  const user = auth.currentUser;

  useEffect(() => {
    if (visible) {
      fetchStarData();
    }
  }, [visible]);

  const fetchStarData = async () => {
    try {
      if (!user) return;
      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);
      const data = snapshot.val();

      console.log("Current stars:", currentStar);
      console.log("Last unlock star:", lastUnlockStar);
    } catch (error) {
      console.error("Error fetching star data:", error);
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(bannerAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(bannerOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      bannerAnim.setValue(0);
      bannerOpacity.setValue(0);
    }
  }, [visible]);

  // Determine which alien to show based on current star count
  const getAlienImage = () => {
    if (currentStar === 6 || currentStar === 12 || currentStar === 17) {
      // if (currentStar > lastUnlockStar) {
      //   return null; // Not yet marked as unlocked — don't show it
      // }
      if (currentStar === 6) return require('../assets/AlienCompanion/orangeAlien.png');
      if (currentStar === 12) return require('../assets/AlienCompanion/pinkAlien.png');
      if (currentStar === 17) return require('../assets/AlienCompanion/purpleAlien.png');
    }
    return null;
  };

  const alienImage = getAlienImage();

  return (
    <Modal transparent={true} visible={visible} animationType="fade">
      <TouchableOpacity 
        style={styles.modalContainer} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [
                { 
                  translateY: bannerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0]
                  })
                }
              ],
              opacity: bannerOpacity
            }
          ]}
        >
          {alienImage && (
            <Image source={alienImage} style={styles.alienImage} />
          )}
          <Text style={styles.title}>New Alien Companion Unlocked!</Text>
          <Text style={styles.subtitle}>
            {alienName ? `You've unlocked the ${alienName} Alien companion!` : 'Keep focusing to unlock more!'}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  starImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  alienImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  successBanner: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default UnlockScreen;
