import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

type VoiceSearchNativeModule = {
  startListening: () => Promise<string>;
};

const VoiceSearch = NativeModules.VoiceSearch as
  | VoiceSearchNativeModule
  | undefined;

const requestMicrophonePermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const startVoiceSearch = async (): Promise<string> => {
  if (!VoiceSearch?.startListening) {
    throw new Error('Voice search is not available on this device.');
  }

  const hasPermission = await requestMicrophonePermission();

  if (!hasPermission) {
    throw new Error('Microphone permission is required for voice search.');
  }

  return VoiceSearch.startListening();
};
