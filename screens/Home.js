import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { screenStyles } from '../src/styles/onboardStyle';
import { colors, spacing, borderRadius } from '../src/theme';
import { authService } from '../src/services/auth';

export default function HomeScreen({ navigation }) {
  const handleSignOut = async () => {
    const result = await authService.signOut();
    if (result.success) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Landing' }],
      });
    } else {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const currentUser = authService.getCurrentUser();

  return (
    <View style={screenStyles.container}>
      <View style={styles.content}>
        <Text style={screenStyles.title}>Welcome!</Text>
        <Text style={styles.userInfo}>
          Signed in as: {currentUser?.email || 'Unknown'}
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
  infoText: {
    fontSize: 16,
    color: colors.PAPER_YELLOW,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  featureList: {
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  featureItem: {
    fontSize: 16,
    color: colors.SKY_BLUE,
    marginVertical: spacing.xs,
    lineHeight: 22,
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
