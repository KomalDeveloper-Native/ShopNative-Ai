import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DeviceEventEmitter, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

const SESSION_KEY = 'shopNativeSession';

type StoredProfile = {
  fullName?: string;
  email?: string;
  provider?: string;
};

const ProfileScreen = () => {
  const [profile, setProfile] = useState<StoredProfile>({});

  useEffect(() => {
    const loadProfile = async () => {
      const storedProfile = await AsyncStorage.getItem('userProfile');
      const storedSession = await AsyncStorage.getItem(SESSION_KEY);
      const firebaseUser = auth().currentUser;
      const parsedProfile = storedProfile ? JSON.parse(storedProfile) : {};
      const parsedSession = storedSession ? JSON.parse(storedSession) : {};

      setProfile({
        ...parsedSession,
        ...parsedProfile,
        fullName: parsedProfile.fullName ?? firebaseUser?.displayName ?? 'ShopNative Customer',
        email: parsedProfile.email ?? firebaseUser?.email ?? 'Signed in shopper',
      });
    };

    loadProfile().catch(() => undefined);
  }, []);

  const logout = useCallback(async () => {
    await auth().signOut().catch(() => undefined);
    await AsyncStorage.multiRemove([SESSION_KEY, 'userProfile', 'userDetails']);
    DeviceEventEmitter.emit('authSessionChanged');
  }, []);

  const initials = useMemo(
    () =>
      (profile.fullName ?? 'ShopNative Customer')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'SC',
    [profile.fullName],
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.name}>{profile.fullName ?? 'ShopNative Customer'}</Text>
            <Text style={styles.email}>{profile.email ?? 'Signed in shopper'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shopping account</Text>
          <Text style={styles.rowTitle}>Orders, wishlist and checkout details</Text>
          <Text style={styles.rowSubtitle}>Manage your saved styles and view every purchase from the profile tab.</Text>
        </View>

        <Pressable onPress={logout} style={styles.logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16, marginBottom: 20 },
  avatar: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryColor },
  initials: { color: colors.white, fontSize: 20, fontWeight: '900' },
  name: { color: colors.textDark, fontSize: 22, fontWeight: '900' },
  email: { color: colors.textMuted, fontSize: 13, fontWeight: '700', marginTop: 4 },
  card: { padding: 16, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  sectionTitle: { color: colors.textDark, fontSize: 16, fontWeight: '900', marginBottom: 14 },
  rowTitle: { color: colors.textDark, fontSize: 14, fontWeight: '900' },
  rowSubtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 5 },
  logout: { minHeight: 54, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.border, marginTop: 'auto' },
  logoutText: { color: colors.error, fontWeight: '900' },
});

export default ProfileScreen;

