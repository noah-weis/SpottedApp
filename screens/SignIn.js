import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { screenStyles } from '../src/styles/onboard';
import { colors, spacing, borderRadius } from '../src/theme';
import { PAPER_YELLOW } from '../src/theme/colors';

export default function SignInPage({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.content}>
        <View style={screenStyles.buttonContainer}>
            <TouchableOpacity 
            style={[screenStyles.button]}
            onPress={() => console.log('Google selected')}
            >
            <Text style={screenStyles.buttonText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
            style={[screenStyles.button]}
            onPress={() => console.log('Auth selected')}
            >
            <Text style={[screenStyles.buttonText]}>Auth</Text>
            </TouchableOpacity>
        </View>
      </View>
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
        paddingTop: spacing,
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
});