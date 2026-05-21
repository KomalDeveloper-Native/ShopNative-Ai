import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const GOOGLE_WEB_CLIENT_ID =
  '454891694127-7fhpvortbpfvoggkao1lnibrlko346pn.apps.googleusercontent.com';

let googleConfigured = false;

export const configureGoogleSignIn = () => {
  if (googleConfigured) {
    return;
  }

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });
  googleConfigured = true;
};

export const listenToAuthState = (
  callback: (user: FirebaseAuthTypes.User | null) => void,
) => auth().onAuthStateChanged(callback);

export const registerWithEmail = async (
  fullName: string,
  email: string,
  password: string,
) => {
  const credential = await auth().createUserWithEmailAndPassword(email.trim(), password);
  await credential.user.updateProfile({ displayName: fullName.trim() });
  return credential;
};

export const loginWithEmail = (email: string, password: string) =>
  auth().signInWithEmailAndPassword(email.trim(), password);

export const signInWithGoogle = async () => {
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

export const logout = async () => {
  configureGoogleSignIn();
  await GoogleSignin.signOut().catch(() => undefined);
  await auth().signOut();
};
