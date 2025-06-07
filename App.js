import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LandingPage from './screens/Landing';
import SignInPage from './screens/SignIn';
import SignUpPage from './screens/SignUp';
import HomeScreen from './screens/Home';
import CameraScreen from './screens/Camera';
import FeedScreen from './screens/Feed';
import { authService } from './src/services/auth';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    // You could add a loading screen here
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            // User is signed in
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Camera" component={CameraScreen} />
              <Stack.Screen name="Feed" component={FeedScreen} />
            </>
          ) : (
            // User is not signed in
            <>
              <Stack.Screen name="Landing" component={LandingPage} />
              <Stack.Screen name="SignIn" component={SignInPage} />
              <Stack.Screen name="SignUp" component={SignUpPage} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}