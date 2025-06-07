import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { screenStyles } from '../src/styles/onboardStyle';

export default function LandingPage({ navigation }) {
  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.content}>
        <Text style={screenStyles.title}>Spotted</Text>
        <Text style={screenStyles.subtitle}>
          Subtitle Text
        </Text>
      </View>
      <View style={screenStyles.buttonContainer}>
        <TouchableOpacity 
          style={[screenStyles.button]}
          onPress={() => navigation.navigate('SignIn')}
        >
          <Text style={screenStyles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[screenStyles.button]}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={screenStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}