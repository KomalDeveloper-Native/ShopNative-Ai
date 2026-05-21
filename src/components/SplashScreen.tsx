import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../theme';

const SplashScreen = () => {
  const pulse = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(16)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(rise, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fade, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    ]);

    animation.start();

    return () => animation.stop();
  }, [fade, pulse, rise]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.28, 0.08],
  });

  return (
    <LinearGradient
      colors={[colors.background, colors.surface, colors.lightPurple]}
      style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fade,
            transform: [{ translateY: rise }],
          },
        ]}>
        <View style={styles.logoWrap}>
          <Animated.View
            style={[
              styles.logoPulse,
              {
                opacity: pulseOpacity,
                transform: [{ scale: pulseScale }],
              },
            ]}
          />
          <LinearGradient
            colors={[colors.primaryColor, colors.accentColor]}
            style={styles.logo}>
            <FontAwesome name="shopping-bag" size={30} color={colors.white} />
          </LinearGradient>
        </View>

        <Text style={styles.title}>ShopNative</Text>
        <Text style={styles.subtitle}>Fashion, picked for you</Text>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                transform: [
                  {
                    scaleX: pulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.35, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logoWrap: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPulse: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 36,
    backgroundColor: colors.primaryColor,
  },
  logo: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.overlayBorder,
    shadowColor: colors.primaryColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    color: colors.textDark,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 18,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  progressTrack: {
    width: 132,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    marginTop: 26,
  },
  progressFill: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: colors.primaryColor,
  },
});

export default SplashScreen;
