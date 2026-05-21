import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  registerForPushNotifications,
  requestPushNotificationPermission,
} from '../services/pushNotifications';

export type DashboardPermissionState = {
  notificationEnabled: boolean;
  locationEnabled: boolean;
};

const STORAGE_KEY = 'dashboardPermissionState';

const grantedState: DashboardPermissionState = {
  notificationEnabled: true,
  locationEnabled: true,
};

const defaultState: DashboardPermissionState = {
  notificationEnabled: false,
  locationEnabled: false,
};

const isGranted = (status: string) =>
  status === PermissionsAndroid.RESULTS.GRANTED;

export const getDashboardPermissionState =
  async (): Promise<DashboardPermissionState> => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  };

export const requestDashboardPermissions =
  async (): Promise<DashboardPermissionState> => {
    if (Platform.OS !== 'android') {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(grantedState));
      return grantedState;
    }

    const notificationEnabled = await requestPushNotificationPermission();

    if (notificationEnabled) {
      await registerForPushNotifications();
    }

    const locationEnabled = isGranted(
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ),
    );

    const nextState = {
      notificationEnabled,
      locationEnabled,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    return nextState;
  };
