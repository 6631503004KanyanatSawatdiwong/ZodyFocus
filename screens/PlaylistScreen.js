import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { database } from '../firebase/config';
import { ref, onValue } from 'firebase/database';

const { width, height } = Dimensions.get('window'); // Get screen dimensions

export default function PlaylistScreen({ route, navigation }) {
    const { onReturn } = route.params || {};
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPlaylists();
    }, []);

    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            const playlistsRef = ref(database, 'playlists');
            
            onValue(playlistsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const playlistsArray = Object.entries(data).map(([id, playlist]) => ({
                        id,
                        ...playlist
                    }));
                    setPlaylists(playlistsArray);
                } else {
                    setPlaylists([]);
                }
                setLoading(false);
            }, (error) => {
                console.error('Error fetching playlists:', error);
                setLoading(false);
            });
        } catch (error) {
            console.error('Error fetching playlists:', error);
            setLoading(false);
        }
    };

    const handleBackPress = () => {
        if (onReturn) {
            onReturn(); // Call the onReturn function if provided
        }
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <AntDesign name="left" size={16} color="#24A0ED" />
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Select a playlist</Text>
                <Text>You will have a calm and nice adventure with these playlists on</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#24A0ED" />
                </View>
            ) : (
                playlists.map((item, index) => (
                    <View key={index} style={styles.playlistContainer}>
                        <Image
                            source={{ uri: item.coverUrl }}
                            style={styles.coverImage}
                        />
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.text}>{item.description}</Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            if (onReturn) {
                                onReturn(item); // pass playlist data back
                            }
                            navigation.goBack();
                        }}>
                            <AntDesign name="play" size={24} color="gray" />
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 30,
        marginTop: 50,
    },
    headerContainer: {
        paddingVertical: 20,
        paddingHorizontal: 5,
    },
    headerText: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 10,
    },
    playlistContainer: {
        flexDirection: 'row', // Makes image and text align horizontally
        alignItems: 'center', // Aligns items vertically in the center
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#fdfdfd',
        borderRadius: 10,
        justifyContent: 'space-between',
    },
    textContainer: {
        width: 160,
        paddingLeft: 5,
    },
    text: {
        fontSize: 12,
    },
    title: {
        fontSize: 17,
        fontWeight: '500',
        marginBottom: 5,
    },
    coverImage: {
        width: width * 0.2,
        height: width * 0.2,
        borderRadius: 5,
    },
    backButtonText: {
        fontSize: 16,
        color: '#24A0ED',
    },
    backButton: {
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
});