import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { screenStyles } from '../src/styles/onboardStyle';
import { colors, spacing, borderRadius } from '../src/theme';
import { authService } from '../src/services/auth';

export default function SignInPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await authService.signIn(username, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Sign In Failed', result.error);
    }
  };

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  };

  return (
    <View style={screenStyles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.SKY_BLUE}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.SKY_BLUE}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View style={screenStyles.divider} />
        <TouchableOpacity 
          style={[styles.signInButton, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={screenStyles.buttonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.signUpLink}
          onPress={goToSignUp}
        >
          <Text style={styles.linkText}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
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
    buttonDisabled: {
        opacity: 0.6,
    },
    signUpLink: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    linkText: {
        color: colors.SKY_BLUE,
        fontSize: 16,
        textDecorationLine: 'underline',
    },
});