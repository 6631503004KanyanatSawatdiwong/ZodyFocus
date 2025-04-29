import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet, 
  Dimensions, Animated, Easing
} from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function IntroScreen({ navigation }) {
    const floatAnim = useRef(new Animated.Value(0)).current;
    
    // Animation values for sliding aliens
    const purpleSlideAnim = useRef(new Animated.Value(width)).current; // Start off-screen right
    const orangeSlideAnim = useRef(new Animated.Value(-width)).current; // Start off-screen left

    // Star rotation animations
    const starRotationAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Floating animation for astronaut
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -15, duration: 1500, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    
        // Sliding animation for aliens
        Animated.timing(purpleSlideAnim, {
            toValue: width * 0.25,
            duration: 3000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    
        Animated.timing(orangeSlideAnim, {
            toValue: -width * 0.2,
            duration: 3000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();

        // Function to create a back-and-forth rotation animation
        const rotateStar = (animValue) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animValue, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(animValue, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            ).start();
        };

        // Start the rotation for all stars
        rotateStar(starRotationAnim);
    }, []);

    // Interpolation to convert animated value into a rotation degree
    const starRotation = starRotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-15deg', '15deg'], // Rotates back and forth
    });

    return(
        <TouchableOpacity 
            style={styles.fullScreen} 
            onPress={async () => {
                try {
                    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
                    if (isLoggedIn === 'true') {
                        navigation.navigate('ToFocusScreen');
                    } else {
                        navigation.navigate('AuthScreen');
                    }
                } catch (e) {
                    console.error('Login check failed:', e);
                    navigation.navigate('AuthScreen');
                }
            }}
            activeOpacity={1}
        >
            <ImageBackground source={require('../assets/background/space-background.png')} style={styles.background}>
                <View style={styles.container}>
                    <Animated.View style={[styles.bigStarContainer, { transform: [{ rotate: starRotation }] }]}>
                        <Image source={require('../assets/images/star.png')} style={styles.bigStar} />
                    </Animated.View>
                    <Animated.View style={[styles.smallStarContainer , { transform: [{ rotate: starRotation }] }]}>
                        <Image source={require('../assets/images/star.png')} style={styles.smallStar} />
                    </Animated.View>
                    {/* Title and Logo */}
                    <View style={styles.titleContainer}>
                        <Image source={require('../assets/ZodyFocus-Logo.png')} style={styles.logoImage} />
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>Zody</Text>
                            <Text style={styles.title}>Focus</Text>
                        </View>
                    </View>

                    {/* Sliding Purple Alien */}
                    <Animated.View style={[styles.purpleAlienContainer, { transform: [{ translateX: purpleSlideAnim }, { translateY: floatAnim }] }]}>
                        <Image source={require('../assets/AlienCompanion/purpleAlien.png')} style={styles.purpleAlien} />
                    </Animated.View>

                    {/* Sliding Orange Alien */}
                    <Animated.View style={[styles.orangeAlienContainer, { transform: [{ translateX: orangeSlideAnim }, { translateY: floatAnim }] }]}>
                        <Image source={require('../assets/AlienCompanion/orangeAlien.png')} style={styles.orangeAlien} />
                    </Animated.View>

                    {/* Moon should be behind the astronaut */}
                    <Image source={require('../assets/planets/moon.png')} style={styles.moonImage} />

                    <Animated.View style={[styles.thirdStarContainer, { transform: [{ rotate: starRotation }] }]}>
                        <Image source={require('../assets/images/star.png')} style={styles.thirdStar} />
                    </Animated.View>

                    {/* Floating Astronaut */}
                    <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                        <Image source={require('../assets/Character/astronaut.png')} style={styles.astronautImage} />
                    </Animated.View>

                    {/* Pink Alien (remains static) */}
                    <Animated.View style={[styles.pinkAlienContainer, { transform: [{ rotate: starRotation }] }]}>
                        <Image source={require('../assets/AlienCompanion/pinkAlien.png')} style={styles.pinkAlien} />
                    </Animated.View>
                    <View style={styles.tapIconContainer}>
                        <MaterialCommunityIcons name="gesture-double-tap" size={50} color="white" style={styles.tapIcon} />
                        <Text style={styles.tapText}>Tap to continue</Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  background: {
    width: width,
    height: height,
    resizeMode: 'cover',
    position: 'absolute',
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
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 60,
  },
  astronautImage: {
    width: width * 0.7,
    height: width * 0.7,
    bottom: '-10%',
    resizeMode: 'contain',
    transform: [{ rotate: '30deg' }],
  },
  moonImage: {
    width: width*1.35,
    height: width*1.35,
    resizeMode: 'contain',
    position: 'absolute', // Position it absolutely within the parent
    bottom: -200, // Adjust this to control how much is visible
    alignSelf: 'center', // Center the moon horizontally

  },  
  title: {
    fontSize: 40,
    color: 'white',
    fontWeight: '800',
    textAlign: 'left'
  },
  textContainer: {
    alignItems: 'flex-start', // Align text inside the container to the left
    padding: 5,
  },
  titleContainer: {
    position: 'absolute',
    top: '15%', // Move it to the top
    left: '10%', // Align it to the left
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: width*0.22,
    height: width*0.22,
    borderRadius: 15,
    borderColor: 'white',
    borderWidth: 1,
    marginRight: 10, // Space between the logo and text
  },
  pinkAlien: {
    width: width*0.25,
    height: width*0.25,
  },
  pinkAlienContainer: {
    position: 'absolute',
    right: '2%',  // Adjust as needed
    bottom: '35%', // Adjust as needed
  },
  purpleAlien: {
    width: width*0.75,
    height: width*0.75,
  },
  purpleAlienContainer: {
    position: 'absolute',
    right: '0%',
    top: '15%'
  },
  orangeAlien: {
    width: width*0.45,
    height: width*0.45,
    transform: [{ rotate: '15deg' }],
  },
  orangeAlienContainer: {
    position: 'absolute',
    left: '5%',
    top: '30%'
  },
  bigStar: {
    width: 80,
    height: 80,
    transform: [{ rotate: '15deg' }],
  },
  bigStarContainer: {
    position: 'absolute',
    right: 30,
    top: 50
  },
  smallStar: {
    width: 30,
    height: 30,
  },
  smallStarContainer: {
    position: 'absolute',
    left: '15%',
    top: '7%',
  },
  thirdStar: {
    width: 60,
    height: 60,
  },
  thirdStarContainer: {
    position: 'absolute',
    left: '5%',
    bottom: '37%'
  },
  tapIcon: {
    marginBottom: 5,

  },
  tapText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
  tapIconContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
    opacity: 0.5,
  }
});
