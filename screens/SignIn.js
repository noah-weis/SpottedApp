import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { screenStyles } from '../src/styles/onboardStyle';
import { colors, spacing, borderRadius } from '../src/theme';
import { useGoogleAuth } from '../src/services/auth';
import LandingPage from './Landing';

export default function SignInPage({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithGoogle } = useGoogleAuth();

  const handleGoogleSignIn = async () => {
    try {
      console.log('Attempting Google sign-in...');
      const userCredential = await signInWithGoogle();
      if (userCredential && userCredential.user) {
        console.log('Google sign-in success:', userCredential.user.email);
        // Navigate to the main app or handle successful sign-in
        // navigation.navigate('MainApp'); // Uncomment when you have a main app screen
      } else {
        Alert.alert('Sign In Failed', 'Google sign-in did not complete successfully.');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'An unexpected error occurred during sign-in.';
      
      if (error.message.includes('dismissed')) {
        errorMessage = 'Sign-in was cancelled.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Google Sign-In Error', errorMessage);
    }
  };

  return (
    <View style={screenStyles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.SKY_BLUE}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.SKY_BLUE}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={() => console.log('Sign in attempt', { email, password })}
        >
          <Text style={screenStyles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        
        <View style={screenStyles.divider} />
        
        <View style={styles.alternativeSignIn}>
          <TouchableOpacity 
            style={[screenStyles.button]}
            onPress={handleGoogleSignIn}
          >
            <Text style={screenStyles.buttonText}>Google</Text>
          </TouchableOpacity>
        <TouchableOpacity 
          style={[screenStyles.button]}
          onPress={() => navigation.goBack()}
        >
          <Text style={screenStyles.buttonText}>Back</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        width: '100%',
    },
    input: {
        color: colors.PAPER_YELLOW,
        backgroundColor: colors.SPIRIT_GREEN,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.md,
        fontSize: 16,
    },
    signInButton: {
        backgroundColor: colors.SPIRIT_GREEN,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        alignItems: 'center',
    },
    alternativeSignIn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
});