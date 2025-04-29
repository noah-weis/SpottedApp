import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FIREBASE_WEB_CLIENT_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: FIREBASE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    redirectUri: 'https://auth.expo.io/@nweis/spotted',
    responseType: 'id_token',
    iosClientId: FIREBASE_WEB_CLIENT_ID, // Use the same client ID for iOS
    extraParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  });

  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        const { id_token } = result.params;
        const credential = GoogleAuthProvider.credential(id_token);
        return signInWithCredential(auth, credential);
      }
      return null;
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  };

  return {
    signInWithGoogle,
    request,
    response,
  };
}

export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
};