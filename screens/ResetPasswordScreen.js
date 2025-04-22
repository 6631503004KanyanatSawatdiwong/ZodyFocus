import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ResetPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');

    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert('Success', 'Password reset email sent!');
            navigation.goBack();
        } catch (error) {
            console.error('Reset error:', error);
            Alert.alert('Error', error.message || 'Failed to send reset email.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.box}>
                <Text style={styles.title}>Reset Password</Text>
                <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                />
                <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                    <Text style={styles.buttonText}>Send Email</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A0A0A',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20
    },
    box: {
        backgroundColor: '#1F1F1F',
        padding: 30,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 30,
        fontWeight: 'bold'
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        width: '100%',
        padding: 12,
        borderRadius: 8,
        marginBottom: 30,
    },
    button: {
        backgroundColor: '#E8D5B5',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        marginBottom: 15,
    },
    buttonText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 14
    },
    backText: {
        color: '#ccc',
        fontSize: 14,
        // marginTop: 10,
        textDecorationLine: 'underline'
    }
});
