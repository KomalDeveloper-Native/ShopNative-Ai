import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

type PushNotificationNativeModule = {
  registerDevice: () => Promise<string>;
  getCachedToken: () => Promise<string | null>;
};

const PushNotification = NativeModules.PushNotification as
  | PushNotificationNativeModule
  | undefined;

const FCM_TOKEN_STORAGE_KEY = 'shopnativeFcmToken';

const isGranted = (status: string) =>
  status === PermissionsAndroid.RESULTS.GRANTED;

export const requestPushNotificationPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Number(Platform.Version) < 33) {
    return true;
  }

  const status = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return isGranted(status);
};

export const registerForPushNotifications = async () => {
  if (Platform.OS !== 'android' || !PushNotification?.registerDevice) {
    return null;
  }

  const token = await PushNotification.registerDevice();
  await AsyncStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);

  return token;
};

export const getCachedPushToken = async () => {
  const storedToken = await AsyncStorage.getItem(FCM_TOKEN_STORAGE_KEY);

  if (storedToken || Platform.OS !== 'android') {
    return storedToken;
  }

  return PushNotification?.getCachedToken?.() ?? null;
};

export const setupPushNotifications = async () => {
  const hasPermission = await requestPushNotificationPermission();

  if (!hasPermission) {
    return null;
  }

  return registerForPushNotifications();
};
