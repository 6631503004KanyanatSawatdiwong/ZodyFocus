import React, { useState, useRef, useEffect } from 'react';
import { 
    View, Text, TextInput, StyleSheet, ImageBackground, Image, ScrollView, FlatList,
    Animated, TouchableOpacity, Alert, Easing, Platform, TouchableWithoutFeedback,
    KeyboardAvoidingView, Keyboard, Dimensions, ActivityIndicator
} from 'react-native';
import { ref, push, onValue, update, get } from 'firebase/database';
import { database } from '../firebase/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UnlockScreen from './UnlockScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { auth } from '../firebase/firebaseConfig';

const { width, height } = Dimensions.get('window');

export default function ToFocusScreen({ route, navigation }) {
    console.log("🔍 ToFocusScreen Navigation Object:", navigation);
    const bannerOpacity = useRef(new Animated.Value(0)).current;
    const bannerTranslateY = useRef(new Animated.Value(300)).current;
    const [focusName, setFocusName] = useState('');
    const [selectedTime, setSelectedTime] = useState(1); // Default focus time in minutes
    const [isBannerVisible, setIsBannerVisible] = useState(false);
    const [currentStar, setCurrentStar] = useState(0);
    const [isUnlockModalVisible, setIsUnlockModalVisible] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [lastUnlockStar, setLastUnlockStar] = useState(0);
    const [focusSessions, setFocusSessions] = useState([]);
    const user = auth.currentUser;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollViewRef = useRef(null);

    const timerOptions = [1, 5, 10, 30, 45, 60, 90, 120];

    // ⭐ Star Positions (Unchanged)
    const allStars = [
        { top: 1050, left: -15 }, // 🔴 First Star (Starts Gold)
        { top: 990, left: 10 },
        { top: 930, left: -20 },
        { top: 880, left: -75 },
        { top: 815, left: -80 },
        { top: 760, left: -40 },
        // second row
        { top: 640, left: 20 },
        { top: 575, left: 50 },
        { top: 520, left: 100 },
        { top: 450, left: 110 },
        { top: 390, left: 55 },
        { top: 400, left: -20 },
        // third row
        { top: 290, right: 110 },
        { top: 235, right: 110 },
        { top: 175, right: 110 },
        { top: 140, right: 60 },
        { top: 200, right: 20 },
        { top: 250, left: -30 }
    ];

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError(null);
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    navigation.navigate('AuthScreen');
                    return;
                }

                const userRef = ref(database, `users/${userId}`);
                const snapshot = await get(userRef);
                const userData = snapshot.val();

                if (userData) {
                    setCurrentStar(userData.currentStar || 0);
                    setLastUnlockStar(userData.lastUnlockStar || 0);
                    setFocusSessions(userData.focusSessions || []);
                    setLoading(false);

                    // Show unlock modal only when first reaching milestone stars
                    if ((userData.currentStar === 6 && userData.lastUnlockStar < 6) || 
                        (userData.currentStar === 12 && userData.lastUnlockStar < 12) ||
                        (userData.currentStar === 17 && userData.lastUnlockStar < 17)) {
                        // First show the modal
                        setShowUnlockModal(true);
                        
                        // Then update lastUnlockStar and unlocked aliens after a short delay
                        setTimeout(() => {
                            const updateData = {
                                lastUnlockStar: userData.currentStar
                            };

                            // Add unlocked alien based on star count
                            if (userData.currentStar === 6) {
                                updateData.unlockedAliens = {
                                    ...(userData.unlockedAliens || {}),
                                    orangeAlien: true
                                };
                            } else if (userData.currentStar === 12) {
                                updateData.unlockedAliens = {
                                    ...(userData.unlockedAliens || {}),
                                    pinkAlien: true
                                };
                            } else if (userData.currentStar === 17) {
                                updateData.unlockedAliens = {
                                    ...(userData.unlockedAliens || {}),
                                    purpleAlien: true
                                };
                            }

                            update(userRef, updateData);
                        }, 100);
                    }
                } else {
                    setError('Failed to load user data');
                }
            } catch (error) {
                console.error('Error loading initial data:', error);
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [navigation]);

    useEffect(() => {
        if (isBannerVisible) {
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(bannerOpacity, {
                        toValue: 1, // Fully visible
                        duration: 1000, // Smooth fade-in
                        useNativeDriver: true,
                    }),
                    Animated.timing(bannerTranslateY, {
                        toValue: 0, // Moves into view
                        duration: 1000, // Smooth slide-up
                        easing: Easing.out(Easing.ease), // Smooth easing
                        useNativeDriver: true,
                    })
                ]).start();
            }, 500); // Slight delay before appearing
        }
    }, [isBannerVisible]); // Run this effect only when isBannerVisible changes

    const handleGoButton = async () => {
        if (!focusName.trim()) {
            Alert.alert('Focus Required', 'Please enter a focus name.');
            return;
        }
    
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                navigation.navigate('CharacterScreen');
                return;
            }
    
            navigation.navigate('OnFocusScreen', { 
                selectedTime,
                focusName,
                userId,
                startTime: Date.now() // Pass start time to OnFocusScreen
            });
    
        } catch (error) {
            console.error("Error:", error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };

    const handleStarClick = (index) => {
        if (index === currentStar) {
            setIsBannerVisible(!isBannerVisible);
        }
    };

    const handleFocusNameSubmit = () => {
        Keyboard.dismiss();
        // Reset any keyboard-related layout adjustments
        if (Platform.OS === 'android') {
            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }, 50);
        }
    };

    if (loading) {
        return (
            <ImageBackground 
                source={require('../assets/background/space-background.png')}
                style={styles.background}
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            </ImageBackground>
        );
    }

    if (error) {
        return (
            <ImageBackground 
                source={require('../assets/background/space-background.png')}
                style={styles.background}
            >
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => navigation.replace('ToFocusScreen')}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        );
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -500}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ImageBackground 
                    source={require('../assets/background/space-background.png')} 
                    style={styles.background} 
                    resizeMode="cover"
                >
                    <ScrollView 
                        ref={scrollViewRef}
                        contentContainerStyle={[
                            styles.scrollContainer, 
                            isBannerVisible && { marginBottom: 150 }
                        ]}
                        keyboardShouldPersistTaps="handled"
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        onScrollBeginDrag={() => {
                            if (Platform.OS === 'android') {
                                Keyboard.dismiss();
                            }
                        }}
                    >
                        <TouchableOpacity style={styles.backButtonWrapper} onPress={() => navigation.navigate('HomeScreen')}>
                            <Ionicons name="chevron-back" size={24} color="black" style={styles.backButton} />
                        </TouchableOpacity>
                        <View style={styles.container}>                    
                            {/* UnlockScreen Modal */}
                            {showUnlockModal && (
                                <UnlockScreen
                                    visible={showUnlockModal}
                                    onClose={() => setShowUnlockModal(false)}
                                    currentStar={currentStar}
                                    lastUnlockStar={lastUnlockStar}
                                />
                            )}
                        </View>

                        <Image 
                            source={currentStar >= 17 ? require('../assets/planets/fourth-planet.png') : require('../assets/planets/grey-fourth-planet copy.png')} 
                            style={styles.moonImageRight} 
                        />            

                        <Image 
                            source={currentStar >= 12 ? require('../assets/planets/third-planet.png') : require('../assets/planets/grey-third-planet copy.png')} 
                            style={styles.moonImageLeft} 
                        />

                        <Image 
                            source={currentStar >= 6 ? require('../assets/planets/second-planet.png') : require('../assets/planets/grey-second-planet copy.png')} 
                            style={styles.moonImageRight} 
                        />

                        {/* ⭐ Star Row 3 */}
                        <View style={{ position: 'absolute', top: 0 }}>
                            {allStars.map((pos, index) => (
                                <TouchableOpacity 
                                    key={index} 
                                    onPress={() => handleStarClick(index)}
                                    disabled={index !== currentStar} // Only current star is clickable
                                >
                                    <Image 
                                        source={index <= currentStar ? require('../assets/images/star.png') : require('../assets/images/star-grey.png')} 
                                        style={{ width: 60, height: 60, position: 'absolute', ...pos }}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Image source={require('../assets/planets/start-planet.png')} style={styles.moonImageLeft} />
                    </ScrollView>

                    {isBannerVisible && (
                        <Animated.View 
                            style={[styles.banner, { 
                                opacity: bannerOpacity, 
                                transform: [{ translateY: bannerTranslateY }]
                            }]}
                            pointerEvents="auto" // Ensures buttons inside are clickable
                        >                                          
                            <View style={styles.bannerTextContainer}>
                                <TouchableOpacity 
                                    style={styles.closeButton} 
                                    onPress={() => setIsBannerVisible(false)}
                                >
                                    <Text style={styles.closeButtonText}>X</Text>
                                </TouchableOpacity>

                                <Text style={styles.bannerText}>What do you like to focus on?</Text>
                                <TextInput 
                                    style={styles.input} 
                                    placeholder="e.g. Study" 
                                    placeholderTextColor="gray" 
                                    value={focusName} 
                                    onChangeText={setFocusName}
                                    selectTextOnFocus={false}
                                    contextMenuHidden={true}
                                    textAlignVertical="center"
                                    onSubmitEditing={handleFocusNameSubmit}
                                    returnKeyType="done"
                                />

                                {/* Timer Selection */}
                                <FlatList
                                    data={timerOptions}
                                    keyExtractor={(item) => item.toString()}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.timerList}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity 
                                            style={[
                                                styles.timerButton, 
                                                selectedTime === item && styles.selectedTimer
                                            ]}
                                            onPress={() => setSelectedTime(item)}
                                        >
                                            <Text style={[styles.timerText, selectedTime === item && styles.selectedTimerText]}>{item} min</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <TouchableOpacity 
                                    style={[styles.goButton, focusName.trim() ? {} : styles.disabledButton]} 
                                    onPress={handleGoButton}
                                    disabled={!focusName.trim()}
                                >
                                    <Text style={styles.goButtonText}>GO</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}
                </ImageBackground>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1, 
        width: '100%',
        height: '100%',
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 50,
    },
    moonImageLeft: {
        width: width * 0.8,
        height: width * 0.8,
        resizeMode: 'contain',
        left: '-40%'
    },
    moonImageRight: {
        width: width * 0.8,
        height: width * 0.8,
        resizeMode: 'contain',
        right: '-40%'
    },
    starRow: {
        position: 'absolute',
        left: '10%',
    },
    star: {
        width: 60,
        height: 60,
    },
    banner: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: '40%', // Adjusted for better spacing
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'space-evenly', // Ensures even spacing
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingVertical: 10, // Reduce excessive space
    },
    bannerTextContainer: {
        alignItems: 'center',
        width: '80%', // Consistent width for elements
    },   
    bannerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
        marginVertical: 15
    },
    input: {
        color: 'black',
        fontSize: 20,
        textAlign: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        width: '80%',
        paddingVertical: 5,
        marginVertical: 15
    },
    subText: {
        fontSize: 18,
        color: 'black',
        textAlign: 'center',
        marginVertical: 10
    },
    goButton: {
        backgroundColor: '#00C6CA',
        paddingVertical: 9,
        paddingHorizontal: 30,
        borderRadius: 20,
        alignItems: 'center',
        marginVertical: 10,
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#15abad'
    },
    goButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold'
    },
    closeButton: {
        alignSelf: 'flex-end', 
        backgroundColor: '#E0E0E0', 
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50
    },
    closeButtonText: {
        color: 'black',
        fontSize: 18,
        // fontWeight: 'bold'
    },
    timerList: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 5,
        height: 50, 
    },
    timerButton: {
        paddingVertical: 6, 
        paddingHorizontal: 12, 
        marginHorizontal: 5, // Keeps buttons evenly spaced
        borderRadius: 8, 
        backgroundColor: '#E0E0E0',
    },
    selectedTimer: {
        backgroundColor: '#00C6CA',
    },
    selectedTimerText: {
        fontSize: 16,
        color: 'white',
    },
    timerText: {
        fontSize: 16,
        color: 'black',
    },
    disabledButton: {
        backgroundColor: 'gray',
        borderColor: 'gray'
    },
    backButton: {
        // position: 'absolute',
    }, 
    backButtonWrapper: {
        position: 'absolute', // Keep it fixed
        top: 60,  // Adjust based on your design
        left: 20,  // Position on the left side
        zIndex: 10, // Ensure it's above other elements
        backgroundColor: 'white', // Optional: Add a translucent background
        // padding: 5,
        borderRadius: 999,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryButtonText: {
        color: '#000000',
        fontSize: 16,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});