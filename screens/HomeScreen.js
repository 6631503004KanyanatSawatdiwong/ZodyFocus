import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, ImageBackground, Text, TouchableOpacity, Animated, Easing, Dimensions } from 'react-native';
import { database, ref, onValue } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

const characters = [
    { id: '1', image: require('../assets/Character/astronaut.png') },
    { id: '2', image: require('../assets/Character/girlAstronaut.png') },
];

const HomeScreen = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const floatAnim = useRef(new Animated.Value(0)).current;
    const starRotationAnim = useRef(new Animated.Value(0)).current;

    // Function to determine which planet to show based on planetBadges
    const getPlanetImage = (planetBadges) => {
        if (planetBadges.shimmerAdventurer) {
            return require('../assets/planets/fourth-planet.png');
        } else if (planetBadges.rosellePioneer) {
            return require('../assets/planets/third-planet.png');
        } else if (planetBadges.lrisnovaVoyage) {
            return require('../assets/planets/second-planet.png');
        } else {
            return require('../assets/planets/start-planet.png');
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    navigation.navigate('CharacterScreen');
                    return;
                }

                const userRef = ref(database, `users/${userId}`);
                onValue(userRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        setUserData(data);
                    }
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigation.navigate('CharacterScreen');
            }
        };

        fetchUserData();
    }, [navigation]);

    useEffect(() => {
        // Floating animation for astronaut
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -15, duration: 1500, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
            ])
        ).start();

        const rotateStar = (animValue) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animValue, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                    Animated.timing(animValue, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                ])
            ).start();
        };

        rotateStar(starRotationAnim);
    }, []);

    const starRotation = starRotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['-15deg', '15deg'],
    });

    if (!userData) {
        return null; // Or a loading screen
    }

    const characterImage = characters[parseInt(userData.character)].image;

    return (
        <ImageBackground 
            source={require('../assets/background/space-background.png')}
            style={styles.background}
        >
            <View style={styles.container}>
                <View style={styles.profileContainer}>
                    <Text style={styles.userName}>{userData.name}</Text>
                    <TouchableOpacity style={styles.profileImageWrapper} onPress={() => navigation.navigate('ProfileScreen')}>
                        <Image source={characterImage} style={styles.profileImage} />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.titleTextContainer}>
                    <Text style={styles.titleText}>Give yourself this moment,</Text>
                    <Text style={styles.titleText2}>and see how far you can go</Text>
                </View>

                <TouchableOpacity 
                    style={styles.bigStarContainer} 
                    onPress={() => navigation.navigate('ToFocusScreen')}
                >
                    <Image source={require('../assets/images/focus-button.png')} style={styles.bigStar} />
                </TouchableOpacity>

                <Image 
                    source={getPlanetImage(userData.planetBadges || {})} 
                    style={styles.moonImage} 
                />
                <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
                    <Image source={characterImage} style={styles.characterImage} />
                </Animated.View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover', // Ensures it covers the screen
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    characterImage: {
        width: width * 0.7, 
        height: height * 0.7,
        resizeMode: 'contain',
        right: '15%',
        top: '20%',
        transform: [{ rotate: '10deg' }],
        zIndex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        paddingRight: 15
    },
    profileImage: {
        width: 80, 
        height: 80, 
        resizeMode: 'cover',
        left: 2,
        transform: [{ translateY: 20 }, { rotate: '15deg' }], // Adjust to focus on the face
    },      
    profileContainer: {
        position: 'absolute',
        top: 60,
        right: -20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    profileImageWrapper: {
        width: 60,
        height: 60,
        backgroundColor: 'black',
        borderRadius: 35,
        borderWidth: 2,
        borderColor: 'white',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleText: {
        fontSize: 22,
        color: 'white',
        fontWeight: '600',
        alignSelf: 'flex-start'
    },
    titleText2: {
        fontSize: 22,
        color: 'white',
        fontWeight: '600',
        alignSelf: 'flex-end',
        marginTop: 10
    },
    titleTextContainer: {
        width: '85%', // Make it span the full width
        padding: 10, // Add some spacing inside
        position: 'absolute', // Position it freely
        top: '17%', // Adjust placement above the character image
    },
    moonImage: {
        width: width * 1.25,
        height: height * 1.25,
        resizeMode: 'contain',
        position: 'absolute', // Position it absolutely within the parent
        bottom: '-63%', // Adjust this to control how much is visible
        alignSelf: 'flex-end', // Center the moon horizontally
    },
    bigStarContainer: {
        zIndex: 1,
        position: 'absolute',
        right: '-10%',
        top: '15%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    bigStar: {
        width: width * 0.5,
        height: height * 0.5,
        resizeMode: 'contain',
        shadowColor: '#FEBA17',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
         
});

export default HomeScreen; 