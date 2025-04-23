import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { database, ref, onValue } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

const AchievementBanner = () => {
    const [userStreaks, setUserStreaks] = useState({
        currentStreak: 0,
        streaks: {
            twoDays: false,
            threeDays: false,
            fiveDays: false,
            tenDays: false,
            thirtyDays: false
        }
    });

    const [userData, setUserData] = useState({
        currentStar: 0,
        focusSessions: []
    });

    const [planetBadges, setPlanetBadges] = useState({
        starletExplorer: true, // Always unlocked
        lrisnovaVoyage: false,
        rosellePioneer: false,
        shimmerAdventurer: false,
        weekendWarrior: false,
        dreamWalker: false
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return;

                const userRef = ref(database, `users/${userId}`);
                onValue(userRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        // Update streaks data
                        setUserStreaks({
                            currentStreak: data.streaks?.currentStreak || 0,
                            streaks: data.streaks?.streaks || {
                                twoDays: false,
                                threeDays: false,
                                fiveDays: false,
                                tenDays: false,
                                thirtyDays: false
                            }
                        });

                        // Update user data
                        setUserData({
                            currentStar: data.currentStar || 0,
                            focusSessions: data.focusSessions || []
                        });
                    }
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    // Calculate planet badges based on user data
    useEffect(() => {
        const calculatePlanetBadges = () => {
            const newPlanetBadges = {
                starletExplorer: true, // Always unlocked
                lrisnovaVoyage: userData.currentStar >= 6,
                rosellePioneer: userData.currentStar >= 12,
                shimmerAdventurer: userData.currentStar >= 17,
                weekendWarrior: false,
                dreamWalker: false
            };

            // Check for weekend sessions
            const hasWeekendSession = userData.focusSessions.some(session => {
                const sessionDate = new Date(session.createdAt);
                const day = sessionDate.getDay();
                // 0 is Sunday, 6 is Saturday
                return day === 0 || day === 6;
            });
            newPlanetBadges.weekendWarrior = hasWeekendSession;

            // Check if all planets are reached (except dreamWalker)
            const allPlanetsReached = 
                newPlanetBadges.starletExplorer && 
                newPlanetBadges.lrisnovaVoyage && 
                newPlanetBadges.rosellePioneer && 
                newPlanetBadges.shimmerAdventurer && 
                newPlanetBadges.weekendWarrior;
            
            newPlanetBadges.dreamWalker = allPlanetsReached;

            setPlanetBadges(newPlanetBadges);
        };

        calculatePlanetBadges();
    }, [userData]);

    // Streak badge images
    const streakBadges = {
        twoDays: require('../assets/streakBadges/2Days.png'),
        threeDays: require('../assets/streakBadges/3Days.png'),
        fiveDays: require('../assets/streakBadges/5Days.png'),
        tenDays: require('../assets/streakBadges/10Days.png'),
        thirtyDays: require('../assets/streakBadges/30days.png')
    };

    // Planet badge images
    const planetBadgeImages = {
        starletExplorer: require('../assets/planetBadges/Starlet_Explorer.png'),
        lrisnovaVoyage: require('../assets/planetBadges/Lrisnova_Voyage.png'),
        rosellePioneer: require('../assets/planetBadges/Roselle_Pioneer.png'),
        shimmerAdventurer: require('../assets/planetBadges/Shimmer_Adventurer.png'),
        weekendWarrior: require('../assets/planetBadges/Weekend_warrior.png'),
        dreamWalker: require('../assets/planetBadges/Dreamwalker.png')
    };

    return (
        <View style={styles.banner}>
            {/* <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            > */}
                {/* Planets Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.headerContainer}>
                        <View style={styles.headerWrapper}>
                            <Text style={styles.Text}>Planets</Text>
                        </View>
                    </View>
                    
                    <View style={styles.badgeContainer}>
                        <View style={styles.badgeRow}>
                            {/* Heart Explorer */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={planetBadgeImages.starletExplorer} 
                                    style={[styles.badgeImage, { opacity: planetBadges.starletExplorer ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>Starlet Explorer</Text>
                            </View>
                            
                            {/* Feline Voyage */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={planetBadgeImages.lrisnovaVoyage} 
                                    style={[styles.badgeImage, { opacity: planetBadges.lrisnovaVoyage ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>Lrisnova Voyage</Text>
                            </View>
                            
                            {/* Golden Pioneer */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={planetBadgeImages.rosellePioneer} 
                                    style={[styles.badgeImage, { opacity: planetBadges.rosellePioneer ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>Roselle Pioneer</Text>
                            </View>
                        </View>
                        
                        <View style={styles.badgeRow}>
                            {/* Bubblegum Conqueror */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={planetBadgeImages.shimmerAdventurer} 
                                    style={[styles.badgeImage, { opacity: planetBadges.shimmerAdventurer ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>Shimmer Adventurer</Text>
                            </View>
                            
                            {/* Weekend Warrior */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={planetBadgeImages.weekendWarrior} 
                                    style={[styles.badgeImage, { opacity: planetBadges.weekendWarrior ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>Weekend Warrior</Text>
                            </View>
                            
                            {/* Dream Walker */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={planetBadgeImages.dreamWalker} 
                                    style={[styles.badgeImage, { opacity: planetBadges.dreamWalker ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>Dream Walker</Text>
                            </View>
                        </View>
                    </View>
                </View>
                
                {/* Streaks Section */}
                <View style={styles.sectionContainer}>
                    <View style={styles.headerContainer}>
                        <View style={styles.headerWrapper}>
                            <Text style={styles.Text}>Streaks</Text>
                        </View>
                    </View>
                    
                    
                    <View style={styles.badgeContainer}>
                        <View style={styles.badgeRow}>

                            {/* Current Streak Display */}
                            <View style={styles.badgeItem}>
                                <View style={styles.currentStreakContainer}>
                                    <Image source={require('../assets/streakBadges/currentStreak.png')} style={styles.badgeImage} />
                                    <View style={styles.streakNumberContainer}>
                                        <Text style={styles.currentStreakText}>{userStreaks.currentStreak}</Text>
                                    </View>
                                </View>
                                <Text style={styles.badgeText}>Current</Text>
                            </View>

                            {/* 2 Days Streak */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={streakBadges.twoDays} 
                                    style={[styles.badgeImage, { opacity: userStreaks.streaks.twoDays ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>2 Days</Text>
                            </View>
                            
                            {/* 3 Days Streak */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={streakBadges.threeDays} 
                                    style={[styles.badgeImage, { opacity: userStreaks.streaks.threeDays ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>3 Days</Text>
                            </View>
                        </View>
                        
                        <View style={styles.badgeRow}>
                            {/* 5 Days Streak */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={streakBadges.fiveDays} 
                                    style={[styles.badgeImage, { opacity: userStreaks.streaks.fiveDays ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>5 Days</Text>
                            </View>

                            {/* 10 Days Streak */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={streakBadges.tenDays} 
                                    style={[styles.badgeImage, { opacity: userStreaks.streaks.tenDays ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>10 Days</Text>
                            </View>
                            
                            {/* 30 Days Streak */}
                            <View style={styles.badgeItem}>
                                <Image 
                                    source={streakBadges.thirtyDays} 
                                    style={[styles.badgeImage, { opacity: userStreaks.streaks.thirtyDays ? 1 : 0.3 }]} 
                                />
                                <Text style={styles.badgeText}>30 Days</Text>
                            </View>
                        </View>
                    </View>
                </View>
            {/* </ScrollView> */}
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        flex: 1,
        width: '100%',
    },
    scrollView: {
        width: '100%',
    },
    scrollViewContent: {
        paddingBottom: 30,
        width: '100%',
    },
    sectionContainer: {
        marginBottom: 20,
        width: '100%',
    },
    Text: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
        alignSelf: 'flex-start',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 10,
    },
    headerWrapper: {
        flex: 1,
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
        marginHorizontal: 5,
        borderRadius: 15,
    },
    badgeContainer: {
        width: '100%',
        marginBottom: 25
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginTop: 10,
        gap: 5
    },
    badgeItem: {
        alignItems: 'center',
        width: width * 0.25,
        height: width * 0.25,
    },
    badgeImage: {
        width: width * 0.25,
        height: width * 0.25,
        borderRadius: 999,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        marginTop: 5,
        textAlign: 'center',
    },
    currentStreakContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    streakNumberContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -15 }, { translateY: -17 }],
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    currentStreakText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default AchievementBanner;