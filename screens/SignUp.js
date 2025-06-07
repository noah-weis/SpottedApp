import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { screenStyles } from '../src/styles/onboardStyle';
import { colors, spacing, borderRadius } from '../src/theme';
import { authService } from '../src/services/auth';

export default function SignUpPage({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Validation states
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Validation functions
  const validateUsername = (username) => {
    if (!username) {
      return '';
    } else if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return '';
    } else if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      return '';
    } else if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return '';
  };

  // Handle input changes with validation
  const handleUsernameChange = (text) => {
    setUsername(text);
    setUsernameError(validateUsername(text));
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setPasswordError(validatePassword(text));
    // Re-validate confirm password when password changes
    if (confirmPassword) {
      setConfirmPasswordError(text !== confirmPassword ? 'Passwords do not match' : '');
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setConfirmPasswordError(validateConfirmPassword(text));
  };

  // Check if form is valid
  const isFormValid = () => {
    return username && 
           password && 
           confirmPassword && 
           !usernameError && 
           !passwordError && 
           !confirmPasswordError && 
           !loading;
  };

  const handleSignUp = async () => {
    // Final validation check
    const usernameErr = validateUsername(username);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(confirmPassword);
    
    setUsernameError(usernameErr);
    setPasswordError(passwordErr);
    setConfirmPasswordError(confirmPasswordErr);

    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (usernameErr || passwordErr || confirmPasswordErr) {
      Alert.alert('Error', 'Please fix the errors above');
      return;
    }

    setLoading(true);
    const result = await authService.signUp(username, password);
    setLoading(false);

    if (result.success) {
      console.log('Account created successfully:', result.user);
    } else {
      Alert.alert('Sign Up Failed', result.error);
    }
  };

  const goToSignIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <View style={screenStyles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput
          style={[styles.input, usernameError ? styles.inputError : null]}
          placeholder="Username"
          placeholderTextColor={colors.SKY_BLUE}
          value={username}
          onChangeText={handleUsernameChange}
          autoCapitalize="none"
        />
        {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
        
        <TextInput
          style={[styles.input, passwordError ? styles.inputError : null]}
          placeholder="Password"
          placeholderTextColor={colors.SKY_BLUE}
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        
        <TextInput
          style={[styles.input, confirmPasswordError ? styles.inputError : null]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.SKY_BLUE}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry
        />
        {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        
        <View style={screenStyles.divider} />
        
        <TouchableOpacity 
          style={[
            styles.signUpButton, 
            !isFormValid() && styles.buttonDisabled
          ]}
          onPress={handleSignUp}
          disabled={!isFormValid()}
        >
          <Text style={screenStyles.buttonText}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.signInLink}
          onPress={goToSignIn}
        >
          <Text style={styles.linkText}>
            Already have an account? Sign In
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.SKY_BLUE,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  input: {
    color: colors.PAPER_YELLOW,
    backgroundColor: colors.SPIRIT_GREEN,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: spacing.md,
    marginTop: -spacing.sm,
    marginLeft: spacing.sm,
  },
  signUpButton: {
    backgroundColor: colors.SPIRIT_GREEN,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  signInLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    color: colors.SKY_BLUE,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});