import auth from '@react-native-firebase/auth';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Toast from 'react-native-simple-toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { logout } from '../../services/authService';
import { colors } from '../../theme';

const ProfileScreen = () => {
  const [loading, setLoading] = useState(false);
  const user = auth().currentUser;
  const displayName = user?.displayName || 'ShopNative Customer';
  const email = user?.email || 'Signed in shopper';
  const provider = user?.providerData[0]?.providerId ?? 'firebase';

  const initials = useMemo(
    () =>
      displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'SC',
    [displayName],
  );

  const handleLogout = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await logout();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      Toast.show(message, Toast.SHORT);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shopping account</Text>
          <Text style={styles.rowTitle}>Provider</Text>
          <Text style={styles.rowSubtitle}>{provider}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.rowTitle}>Orders, wishlist and checkout</Text>
          <Text style={styles.rowSubtitle}>
            Cart, wishlist and order history stay on this device. Passwords and tokens stay with Firebase.
          </Text>
        </View>

        <Pressable disabled={loading} onPress={handleLogout} style={styles.logout}>
          <Text style={styles.logoutText}>{loading ? 'Logging out...' : 'Logout'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 20 },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16, marginBottom: 20 },
  identityCopy: { flex: 1, minWidth: 0 },
  avatar: { width: 62, height: 62, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryColor },
  initials: { color: colors.white, fontSize: 20, fontWeight: '900' },
  name: { color: colors.textDark, fontSize: 22, fontWeight: '900' },
  email: { color: colors.textMuted, fontSize: 13, fontWeight: '700', marginTop: 4 },
  card: { padding: 16, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: 14 },
  sectionTitle: { color: colors.textDark, fontSize: 16, fontWeight: '900', marginBottom: 14 },
  rowTitle: { color: colors.textDark, fontSize: 14, fontWeight: '900' },
  rowSubtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 17, fontWeight: '700', marginTop: 5 },
  logout: { minHeight: 54, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.black, marginTop: 'auto' },
  logoutText: { color: colors.white, fontWeight: '900' },
});

export default ProfileScreen;
