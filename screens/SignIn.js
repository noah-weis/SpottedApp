import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { screenStyles } from '../src/styles/onboardStyle';
import { colors, spacing, borderRadius } from '../src/theme';
import { useGoogleAuth } from '../src/services/auth';

export default function SignInPage({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithGoogle } = useGoogleAuth();

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithGoogle();
      console.log('Google sign-in success:', userCredential.user.email);
      // Here you would typically navigate to your main app screen
    } catch (error) {
      Alert.alert('Error', error.message);
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