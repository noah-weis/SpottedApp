import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';
import { FIREBASE_WEB_CLIENT_ID, FIREBASE_IOS_CLIENT_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

// Helper function to get and log the redirect URI for debugging
export function getRedirectUri() {
  const uri = AuthSession.makeRedirectUri({
    scheme: 'com.nweis.spotted',
  });
  console.log('Redirect URI:', uri);
  return uri;
}

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: FIREBASE_IOS_CLIENT_ID,
    webClientId: FIREBASE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'com.nweis.spotted',
    }),
  });

  const signInWithGoogle = async () => {
    try {
      const result = await promptAsync();
      console.log('Google auth result:', result);
      
      if (result.type === 'success') {
        const { id_token } = result.params;
        if (!id_token) {
          throw new Error('No ID token received from Google');
        }
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential;
      } else if (result.type === 'dismiss') {
        throw new Error('Google sign-in was dismissed by user');
      } else {
        throw new Error(`Google sign-in failed with type: ${result.type}`);
      }
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