import React, { useState, useEffect } from 'react';
import {
    View, Image, StyleSheet, ImageBackground,
    Text, TouchableOpacity, TextInput, ScrollView, 
    Alert, Dimensions
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChartLine, faTrophy, faXmark, faGear } from '@fortawesome/free-solid-svg-icons';
import { database, ref, onValue, update } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import StatsBanner from './StatsBanner';
import AchievementBanner from './AchievementBanner';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

const characters = [
    { id: '1', image: require('../assets/Character/astronaut.png') },
    { id: '2', image: require('../assets/Character/girlAstronaut.png') },
];

export default function ProfileScreen({ navigation }) {
    const [userData, setUserData] = useState(null);
    const [bio, setBio] = useState('');
    const [activeButton, setActiveButton] = useState('stats');
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    navigation.navigate('AuthScreen');
                    return;
                }
    
                const userRef = ref(database, `users/${userId}`);
                const unsubscribe = onValue(userRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        setUserData(data);
                        setBio(data.bio || '');
                    }
                });
    
                // return unsubscribe function
                return () => unsubscribe(); // ❗️this will remove the listener
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigation.navigate('AuthScreen');
            }
        };
    
        fetchUserData();
    }, [navigation]);    

    const saveBio = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const userRef = ref(database, `users/${userId}`);
            await update(userRef, {
                bio: bio.trim()
            });
            console.log("Bio saved successfully");
        } catch (error) {
            console.error("Error saving bio:", error);
        }
    };

    const handleButtonPress = (button) => {
        setActiveButton(button);
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.clear();
                        navigation.navigate('AuthScreen');
                    }
                }
            ]
        );
    };

    const handleResetPassword = () => {
        navigation.navigate('ResetPasswordScreen'); 
    };

    if (!userData) return null;

    const characterImage = characters[userData.character]?.image || characters[0].image;

    return (
        <ImageBackground source={require('../assets/background/space-background.png')} style={styles.background}>
            <View style={styles.container}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        {/* Back button */}
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <FontAwesomeIcon icon={faXmark} size={20} color="black" />
                        </TouchableOpacity>

                        {/* Settings button */}
                        <TouchableOpacity 
                            style={styles.settingsButton} 
                            onPress={() => setShowSettings(!showSettings)}
                        >
                            <FontAwesomeIcon icon={faGear} size={20} color="black" />
                        </TouchableOpacity>

                        {showSettings && (
                            <View style={styles.settingsMenu}>
                                <TouchableOpacity onPress={handleResetPassword} style={styles.settingsItem}>
                                    <Text style={styles.settingsText}>Reset Password</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleLogout} style={styles.settingsItem}>
                                    <Text style={styles.settingsText}>Log Out</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Profile section */}
                        <LinearGradient
                            colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.1)']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                            style={styles.profileContainer}
                        >
                            <View>
                                <View style={styles.profileImageWrapper}>
                                    <Image source={characterImage} style={styles.profileImage} />
                                </View>
                                <TouchableOpacity style={styles.changeButton} onPress={() => navigation.navigate('ChangeCharacterScreen')}>
                                    <Text style={styles.changeText}>Change</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.userNameWrapper}>
                                <Text style={styles.userName}>{userData.name}</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Add Bio"
                                        placeholderTextColor="white"
                                        value={bio}
                                        onChangeText={setBio}
                                        multiline={true}
                                        textAlignVertical="top"
                                        onSubmitEditing={saveBio}
                                        blurOnSubmit={true}
                                        returnKeyType="done"
                                    />
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Stats and Achievements */}
                        <View style={styles.statsSection}>
                            <View style={styles.statsContainer}>
                                <TouchableOpacity
                                    style={[styles.statsWrapper, activeButton === 'stats' && styles.activeButton]}
                                    onPress={() => handleButtonPress('stats')}
                                >
                                    <FontAwesomeIcon icon={faChartLine} size={22} color={activeButton === 'stats' ? 'black' : 'white'} />
                                    <Text style={[styles.statsText, activeButton === 'stats' && styles.activeText]}>STATS</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.statsWrapper, activeButton === 'achievement' && styles.activeButton]}
                                    onPress={() => handleButtonPress('achievement')}
                                >
                                    <FontAwesomeIcon icon={faTrophy} size={22} color={activeButton === 'achievement' ? 'black' : 'white'} />
                                    <Text style={[styles.statsText, activeButton === 'achievement' && styles.activeText]}>ACHIEVEMENT</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.bannerContainer}>
                                {activeButton === 'stats' && <StatsBanner />}
                                {activeButton === 'achievement' && <AchievementBanner />}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        paddingRight: 15
    },
    userNameWrapper: {
        padding: 10,
        marginHorizontal: 10,
        flex: 1
    },
    profileContainer: {
        width: '80%',
        padding: 20,
        borderWidth: 1,
        borderColor: '#676767',
        borderRadius: 25,
        flexDirection: 'row',
        marginTop: 120,
    },
    profileImage: {
        width: width * 0.4,
        height: width * 0.4,
        resizeMode: 'cover',
        left: 2,
        transform: [{ translateY: 35 }, { translateX: 5 }],
    },
    profileImageWrapper: {
        width: width * 0.3,
        height: width * 0.3,
        backgroundColor: 'black',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#676767',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeText: {
        fontSize: 12,
        color: 'black',
        alignSelf: 'center',
        fontWeight: '500',
    },
    changeButton: {
        backgroundColor: '#E8D5B5',
        padding: 5,
        marginTop: 15,
        width: '60%',
        alignSelf: 'center',
        borderRadius: 25,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
    },
    inputContainer: {
        flex: 1,
        minHeight: 40,
        paddingTop: 5,
    },
    input: {
        color: 'white',
        fontSize: 14,
        paddingVertical: 5,
        textAlign: 'left',
        flexWrap: 'wrap'
    },
    statsSection: {
        width: '80%',
        marginTop: 10,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#E8D5B5',
        justifyContent: 'space-around',
        padding: 7,
        borderRadius: 25,
        marginBottom: 10,
        marginTop: 10, 
    },
    statsText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12
    },
    statsWrapper: {
        paddingHorizontal: 25,
        paddingVertical: 5,
        borderRadius: 25,
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center'
    },
    activeButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    activeText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 12
    },
    bannerContainer: {
        width: '100%',
        minHeight: 300,
        marginTop: 10
    },
    scrollView: {
        flex: 1,
        width: '100%',

    },
    scrollViewContent: {
        flexGrow: 1,
        width: '100%',
        alignItems: 'center',
        paddingTop: 20,
    },
    backButton: {
        top: 50,
        left: 40,
        position: 'absolute',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        zIndex: 2,
    },
    settingsButton: {
        position: 'absolute',
        top: 50,
        right: 40,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 20,
        zIndex: 2,
    },
    settingsMenu: {
        position: 'absolute',
        top: 100,
        right: 40,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        zIndex: 3,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5,
    },
    settingsItem: {
        paddingVertical: 10,
    },
    settingsText: {
        fontSize: 16,
        color: 'black',
    },
});
