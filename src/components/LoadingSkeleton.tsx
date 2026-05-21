import React, { useEffect, useRef } from 'react';
import {
  Animated,
  type DimensionValue,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radii } from '../theme';

type LoadingSkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

const LoadingSkeleton = ({
  width = '100%',
  height = 16,
  radius = radii.sm,
  style,
}: LoadingSkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 780,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 780,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius, opacity },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton = () => (
  <View style={styles.productCard}>
    <LoadingSkeleton height={118} radius={radii.sm} />
    <LoadingSkeleton width="82%" height={14} style={styles.line} />
    <LoadingSkeleton width="56%" height={12} style={styles.smallLine} />
    <LoadingSkeleton width="70%" height={18} style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  productCard: {
    width: 164,
    height: 248,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 10,
    marginRight: 12,
  },
  line: {
    marginTop: 12,
  },
  smallLine: {
    marginTop: 8,
  },
});

export default LoadingSkeleton;
