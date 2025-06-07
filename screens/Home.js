import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { screenStyles } from '../src/styles/onboardStyle';
import { colors, spacing, borderRadius } from '../src/theme';
import { authService } from '../src/services/auth';

export default function HomeScreen({ navigation }) {
  const handleSignOut = async () => {
    const result = await authService.signOut();
    if (!result.success) {
      Alert.alert('Error', 'Failed to sign out');
    }
    // Don't manually navigate - let App.js auth state listener handle it
  };

  const currentUser = authService.getCurrentUser();

  return (
    <View style={screenStyles.container}>
      <View style={styles.content}>
        <Text style={screenStyles.title}>Welcome!</Text>
        <Text style={styles.userInfo}>
          Signed in as: {currentUser?.username || 'Unknown'}
        </Text>
        <Text style={screenStyles.subtitle}>
          You're now signed in
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={screenStyles.buttonText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Feed')}
        >
          <Text style={screenStyles.buttonText}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleSignOut}
        >
          <Text style={screenStyles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  userInfo: {
    fontSize: 16,
    color: colors.PAPER_YELLOW,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: spacing.lg,
  },
  button: {
    backgroundColor: colors.SPIRIT_GREEN,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
