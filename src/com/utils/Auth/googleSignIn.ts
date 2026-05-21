import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export const GOOGLE_WEB_CLIENT_ID =
  '454891694127-7fhpvortbpfvoggkao1lnibrlko346pn.apps.googleusercontent.com';

let configured = false;

export const configureGoogleSignIn = () => {
  if (configured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });
  configured = true;
};

export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.UserCredential | null> => {
  configureGoogleSignIn();

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) {
      throw new Error('Google sign-in token was not returned');
    }

    const credential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(credential);
  } catch (error) {
    const signInError = error as { code?: string };
    if (signInError.code === statusCodes.SIGN_IN_CANCELLED) {
      return null;
    }

    throw error;
  }
};
