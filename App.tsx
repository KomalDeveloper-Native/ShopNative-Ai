import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SplashScreen from './src/components/SplashScreen';
import AppNavigator from './src/navigation/AppNavigator';
import { persistor, store } from './src/redux/store';
import { listenToAuthState } from './src/services/authService';
import { setupPushNotifications } from './src/services/pushNotifications';
import { colors } from './src/theme';

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToAuthState(user => {
      setIsSignedIn(Boolean(user));
      setAuthReady(true);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setSplashDone(true), 1200);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!authReady || !splashDone || !isSignedIn) {
      return;
    }

    setupPushNotifications().catch(error => {
      console.warn('Push notification setup failed', error);
    });
  }, [authReady, isSignedIn, splashDone]);

  return (
    <Provider store={store}>
      <PersistGate loading={<SplashScreen />} persistor={persistor}>
        <SafeAreaProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
            {authReady && splashDone ? (
              <NavigationContainer>
                <AppNavigator isSignedIn={isSignedIn} />
              </NavigationContainer>
            ) : (
              <SplashScreen />
            )}
          </SafeAreaView>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default App;
