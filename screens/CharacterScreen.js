import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, ImageBackground, TextInput, FlatList, 
  StyleSheet, Dimensions, Animated, TouchableOpacity, Alert, Image
} from 'react-native';
import { database, ref, set } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const characters = [
    { id: '1', image: require('../assets/Character/astronaut.png') },
    { id: '2', image: require('../assets/Character/girlAstronaut.png') },
];

export default function CharacterScreen({ navigation }) {
    const [selectedCharacter, setSelectedCharacter] = useState(0);
    const [userName, setUserName] = useState('');
    const scrollX = useRef(new Animated.Value(0)).current;
    const bannerOpacity = useRef(new Animated.Value(0)).current;
    const bannerTranslateY = useRef(new Animated.Value(-100)).current;

    const handleStart = async () => {
        if (!userName.trim()) {
            Alert.alert('Name Required', 'Please enter your name before proceeding.');
            return;
        }

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                Alert.alert('Error', 'No authenticated user found. Please login first.');
                return;
            }

            // Save user data to Firebase
            const userRef = ref(database, `users/${currentUser.uid}`);
            await set(userRef, {
                character: selectedCharacter,
                createdAt: new Date().toISOString(),
                currentStar: 0,
                email: currentUser.email,
                lastUnlockStar: 0,
                name: userName.trim(),
                planetBadges: {
                    starletExplorer: true, // Always unlocked
                    lrisnovaVoyage: false,
                    rosellePioneer: false,
                    shimmerAdventurer: false,
                    weekendWarrior: false,
                    dreamWalker: false
                },
                streaks: {
                    currentStreak: 0,
                },
                updatedAt: new Date().toISOString()
            });

            // Save user ID to AsyncStorage
            await AsyncStorage.setItem('userId', currentUser.uid);

            // Navigate to HomeScreen with the selected character and username
            navigation.navigate('HomeScreen', { 
                characterImage: characters[selectedCharacter].image, 
                userName: userName.trim() 
            });

        } catch (error) {
            console.error("Error saving user data:", error);
            Alert.alert('Error', 'Failed to save user data. Please try again.');
        }
    };
    

    useEffect(() => {
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(bannerOpacity, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(bannerTranslateY, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ]).start();
        }, 1000);
    }, []);

    return (
        <ImageBackground source={require('../assets/background/space-background.png')} style={styles.background}>
            <Animated.View style={[styles.banner, { 
                opacity: bannerOpacity, 
                transform: [{ translateY: bannerTranslateY }] 
            }]}>
                <Image 
                    source={require('../assets/images/blueFrameTop.png')} 
                    style={styles.bannerImage}
                    resizeMode="contain"
                />
                <View style={styles.bannerTextContainer}>
                    <Text style={styles.bannerText}>Choose Your Character</Text>
                    <Text style={styles.bannerSubText}>You can change anytime</Text>
                </View>
            </Animated.View>

            <View style={styles.container}>
                <FlatList
                    data={characters}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                    )}
                    onMomentumScrollEnd={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.x / width);
                        setSelectedCharacter(index);
                    }}
                    renderItem={({ item, index }) => {
                        const scale = scrollX.interpolate({
                            inputRange: [
                                (index - 1) * width,
                                index * width,
                                (index + 1) * width
                            ],
                            outputRange: [0.8, 1, 0.8],
                            extrapolate: 'clamp'
                        });

                        return (
                            <View style={styles.characterWrapper}>
                                <Animated.Image 
                                    source={item.image} 
                                    style={[styles.characterImage, { transform: [{ scale }] }]} 
                                />
                            </View>
                        );
                    }}
                />
            </View>

            <View style={styles.inputContainer}>
                <TextInput 
                    style={styles.input} 
                    placeholder="Enter your name" 
                    placeholderTextColor="white" 
                    value={userName} 
                    onChangeText={setUserName}
                />
            </View>

            <TouchableOpacity 
                style={[styles.startButton, userName.trim() ? {} : styles.disabledButton]} 
                onPress={handleStart}
                disabled={!userName.trim()}
            >
                <Text style={styles.startButtonText}>START</Text>
            </TouchableOpacity>

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
    banner: {
        position: 'absolute',
        top: -40,
        width: '100%',
        height: '30%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bannerImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    bannerTextContainer: {
        alignItems: 'center',
        paddingTop: 10,
        zIndex: 1,
    },    
    bannerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    bannerSubText: {
        fontSize: 16,
        color: 'white',
        marginTop: 5
    },
    characterWrapper: {
        width: width, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    characterImage: {
        width: width * 0.8,
        height: width * 0.8,
        resizeMode: 'contain'
    },
    inputContainer: {
        position: 'absolute',
        bottom: 150,
        width: '60%',
        alignSelf: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'white',
    },
    input: {
        color: 'white',
        fontSize: 20,
        paddingVertical: 5,
        textAlign: 'center',
    },
    startButton: {
        backgroundColor: 'white',
        bottom: 70,
        paddingHorizontal: 30,
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'white'
    },
    startButtonText: {
        color: 'black',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold'
    },
    disabledButton: {
        backgroundColor: 'gray',
        borderColor: 'gray'
    }
});
