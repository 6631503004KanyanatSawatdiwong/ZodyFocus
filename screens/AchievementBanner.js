import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { database, ref, onValue, update } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

// Move image requires outside component to ensure they're cached
const planetBadgeImages = {
    starletExplorer: require('../assets/planetBadges/Starlet_Explorer.png'),
    irisnovaVoyage: require('../assets/planetBadges/irisnova_Voyage.png'),
    rosellePioneer: require('../assets/planetBadges/Roselle_Pioneer.png'),
    shimmerAdventurer: require('../assets/planetBadges/Shimmer_Adventurer.png'),
    weekendWarrior: require('../assets/planetBadges/Weekend_warrior.png'),
    dreamWalker: require('../assets/planetBadges/Dreamwalker.png')
};

const streakBadges = {
    twoDays: require('../assets/streakBadges/2Days.png'),
    threeDays: require('../assets/streakBadges/3Days.png'),
    fiveDays: require('../assets/streakBadges/5Days.png'),
    tenDays: require('../assets/streakBadges/10Days.png'),
    thirtyDays: require('../assets/streakBadges/30days.png'),
    currentStreak: require('../assets/streakBadges/currentStreak.png')
};

const AchievementBanner = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [loadedImages, setLoadedImages] = useState({});
    const [userStreaks, setUserStreaks] = useState({
        currentStreak: 0
    });
      
    const currentStreak = userStreaks.currentStreak;

    const [userData, setUserData] = useState({
        currentStar: 0,
        focusSessions: []
    });

    const [planetBadges, setPlanetBadges] = useState({
        starletExplorer: true, // Always unlocked
        irisnovaVoyage: false,
        rosellePioneer: false,
        shimmerAdventurer: false,
        weekendWarrior: false,
        dreamWalker: false
    });

    const onImageLoad = (imageName) => {
        setLoadedImages(prev => ({
            ...prev,
            [imageName]: true
        }));
    };

    const renderBadgeImage = (source, opacity = 1, imageName) => {
        return (
            <View style={[styles.badgeImageContainer, { opacity }]}>
                {!loadedImages[imageName] && (
                    <ActivityIndicator 
                        size="small" 
                        color="#ffffff" 
                        style={styles.loadingIndicator} 
                    />
                )}
                <Image 
                    source={source} 
                    style={[
                        styles.badgeImage,
                        !loadedImages[imageName] && styles.hiddenImage
                    ]}
                    onLoad={() => onImageLoad(imageName)}
                    fadeDuration={0}
                />
            </View>
        );
    };

    useEffect(() => {
        const fetchUserData = async () => {
          const userId = await AsyncStorage.getItem('userId');
          if (!userId) return;
      
          const userRef = ref(database, `users/${userId}`);
          const unsubscribe = onValue(userRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
              setUserStreaks(data.streaks || { currentStreak: 0 });
              setUserData({
                currentStar: data.currentStar || 0,
                focusSessions: data.focusSessions || []
              });
              setPlanetBadges(data.planetBadges || {
                starletExplorer: true,
                irisnovaVoyage: false,
                rosellePioneer: false,
                shimmerAdventurer: false,
                weekendWarrior: false,
                dreamWalker: false
              });
            }
          });
      
          return () => unsubscribe(); // <== cleanup
        };
      
        fetchUserData();
      }, []);      

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
                                {renderBadgeImage(
                                    planetBadgeImages.starletExplorer, 
                                    planetBadges.starletExplorer ? 1 : 0.3,
                                    'starletExplorer'
                                )}
                                <Text style={styles.badgeText}>Starlet Explorer</Text>
                            </View>

                            {/* Golden Pioneer */}
                            <View style={styles.badgeItem}>
                                {renderBadgeImage(
                                    planetBadgeImages.rosellePioneer,
                                    planetBadges.rosellePioneer ? 1 : 0.3,
                                    'rosellePioneer'
                                )}
                                <Text style={styles.badgeText}>Roselle Pioneer</Text>
                            </View>
                            
                            {/* Bubblegum Conqueror */}
                            <View style={styles.badgeItem}>
                                {renderBadgeImage(
                                    planetBadgeImages.shimmerAdventurer,
                                    planetBadges.shimmerAdventurer ? 1 : 0.3,
                                    'shimmerAdventurer'
                                )}
                                <Text style={styles.badgeText}>Shimmer Adventurer</Text>
                            </View>
                        </View>
                        
                        <View style={styles.badgeRow}>
                            {/* Feline Voyage */}
                            <View style={styles.badgeItem}>
                                {renderBadgeImage(
                                    planetBadgeImages.irisnovaVoyage,
                                    planetBadges.irisnovaVoyage ? 1 : 0.3,
                                    'irisnovaVoyage'
                                )}
                                <Text style={styles.badgeText}>Irisnova Voyage</Text>
                            </View>

                            {/* Dream Walker */}
                            <View style={styles.badgeItem}>
                                {renderBadgeImage(
                                    planetBadgeImages.dreamWalker,
                                    planetBadges.dreamWalker ? 1 : 0.3,
                                    'dreamWalker'
                                )}
                                <Text style={styles.badgeText}>Dream Walker</Text>
                            </View>
                            
                            {/* Weekend Warrior */}
                            <View style={styles.badgeItem}>
                                {renderBadgeImage(
                                    planetBadgeImages.weekendWarrior,
                                    planetBadges.weekendWarrior ? 1 : 0.3,
                                    'weekendWarrior'
                                )}
                                <Text style={styles.badgeText}>Weekend Warrior</Text>
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
                                    {renderBadgeImage(
                                        streakBadges.currentStreak,
                                        1,
                                        'currentStreak'
                                    )}
                                    <View style={styles.streakNumberContainer}>
                                        <Text style={styles.currentStreakText}>{userStreaks.currentStreak}</Text>
                                    </View>
                                </View>
                                <Text style={styles.badgeText}>Current</Text>
                            </View>

                            {/* 2 Days Streak */}
                            <View style={styles.badgeItem}>
                                {renderBadgeImage(
                                    streakBadges.twoDays,
                                    currentStreak >= 2 ? 1 : 0.3,
                                    'twoDays'
                                )}
                                <Text style={styles.badgeText}>2 Days</Text>
                            </View>
                            
                            {/* 3 Days Streak */}
                            <View style={styles.badgeItem}>
                                {renderBadgeImage(
                                    streakBadges.threeDays,
                                    currentStreak >= 3 ? 1 : 0.3,
                                    'threeDays'
                                )}
                                <Text style={styles.badgeText}>3 Days</Text>
                            </View>
                        </View>
                        
                        <View style={styles.badgeRow}>
                            {/* 5 Days Streak */}
                            <View style={styles.badgeItem}>
                                {renderBadgeImage(
                                    streakBadges.fiveDays,
                                    currentStreak >= 5 ? 1 : 0.3,
                                    'fiveDays'
                                )}
                                <Text style={styles.badgeText}>5 Days</Text>
                            </View>

                            {/* 10 Days Streak */}
                            <View style={styles.badgeItem}>
                                {renderBadgeImage(
                                    streakBadges.tenDays,
                                    currentStreak >= 10 ? 1 : 0.3,
                                    'tenDays'
                                )}
                                <Text style={styles.badgeText}>10 Days</Text>
                            </View>
                            
                            {/* 30 Days Streak */}
                            <View style={styles.badgeItem}>
                                {renderBadgeImage(
                                    streakBadges.thirtyDays,
                                    currentStreak >= 30 ? 1 : 0.3,
                                    'thirtyDays'
                                )}
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
    badgeImageContainer: {
        width: width * 0.25,
        height: width * 0.25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingIndicator: {
        position: 'absolute',
        zIndex: 1,
    },
    hiddenImage: {
        opacity: 0,
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