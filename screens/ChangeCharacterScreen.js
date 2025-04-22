import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, ImageBackground, TextInput, FlatList, 
  StyleSheet, Dimensions, Animated, TouchableOpacity, Alert
} from 'react-native';
import { database, ref, set, get } from '../firebaseConfig'; // Import Firebase database functions
import { update } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const characters = [
    { id: '1', image: require('../assets/Character/astronaut.png') },
    { id: '2', image: require('../assets/Character/girlAstronaut.png') },
];

export default function CharacterScreen({ navigation }) {
    const [selectedCharacter, setSelectedCharacter] = useState(0);
    const [userName, setUserName] = useState('');
    const [currentName, setCurrentName] = useState('');
    const scrollX = useRef(new Animated.Value(0)).current;
    const bannerOpacity = useRef(new Animated.Value(0)).current;
    const bannerTranslateY = useRef(new Animated.Value(-100)).current;
    const flatListRef = useRef(null);

    // Fetch user's current name and character when screen loads
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) {
                    Alert.alert('Error', 'User not found. Please try again.');
                    return;
                }
    
                const userRef = ref(database, `users/${userId}`);
                const userSnapshot = await get(userRef);
                const userData = userSnapshot.val() || {};
                const characterIndex = userData.character || 0;
    
                setSelectedCharacter(characterIndex);
                flatListRef.current?.scrollToIndex({ index: characterIndex, animated: false });
    
                setUserName(userData.name || '');
                setCurrentName(userData.name || '');
    
            } catch (error) {
                console.error('Error fetching user data:', error);
                Alert.alert('Error', 'Failed to fetch user data. Please try again.');
            }
        };
    
        fetchUserData();
    }, []);      

    // Ensure selectedCharacter is 0 if user doesn't scroll
    useEffect(() => {
        setSelectedCharacter(0);
    }, []);

    const handleCharacterSelect = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User not found. Please try again.');
                return;
            }

            // Get current user data first
            const userRef = ref(database, `users/${userId}`);
            const userSnapshot = await get(userRef);
            const userData = userSnapshot.val() || {};

            // Update the character and name (only if name is not empty)
            const updatedData = {
                ...userData,
                character: selectedCharacter
            };

            // Only update name if it's not empty
            if (userName.trim()) {
                updatedData.name = userName.trim();
            }

            await set(userRef, updatedData);
            navigation.goBack();
        } catch (error) {
            console.error('Error updating character:', error);
            Alert.alert('Error', 'Failed to update character. Please try again.');
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

            <View style={styles.container}>
                <FlatList
                    ref={flatListRef}
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
                style={styles.selectButton} 
                onPress={handleCharacterSelect}
            >
                <Text style={styles.selectButtonText}>SELECT</Text>
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
        top: 0,
        width: '100%',
        height: '20%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    bannerTextContainer: {
        alignItems: 'center',
        paddingTop: 10,
    },    
    bannerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black',
    },
    bannerSubText: {
        fontSize: 16,
        color: 'black',
        marginTop: 5
    },
    characterWrapper: {
        width: width, 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    characterImage: {
        width: 350,
        height: 350,
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
    selectButton: {
        backgroundColor: 'white',
        bottom: 70,
        paddingHorizontal: 30,
        paddingVertical: 10,
        alignSelf: 'center',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'white'
    },
    selectButtonText: {
        color: 'black',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold'
    },
});