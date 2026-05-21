import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import IconButton from '../atoms/IconButton';
import { colors } from '../theme/color';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: string;
  rightIconSolid?: boolean;
  rightBadgeCount?: number;
  onRightPress?: () => void;
  rightDisabled?: boolean;
  rightSlot?: ReactNode;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const AppHeader = ({
  title,
  subtitle,
  onBack,
  rightIcon,
  rightIconSolid,
  rightBadgeCount = 0,
  onRightPress,
  rightDisabled,
  rightSlot,
  compact = false,
  style,
}: AppHeaderProps) => {
  const showRightBadge = rightBadgeCount > 0;

  return (
    <View style={[styles.header, compact && styles.compactHeader, style]}>
      <IconButton
        icon={onBack ? 'chevron-left' : undefined}
        onPress={onBack}
        color={colors.textDark}
        style={!onBack && styles.hiddenButton}
      />
      <View style={styles.titleWrap}>
        <Text
          style={[styles.title, compact && styles.titleCompact]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightSlot ?? (
        <IconButton
          icon={rightIcon}
          solid={rightIconSolid}
          onPress={onRightPress}
          disabled={rightDisabled || !rightIcon}
          color={colors.textDark}
          style={!rightIcon && styles.hiddenButton}
        >
          {showRightBadge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{rightBadgeCount}</Text>
            </View>
          ) : null}
        </IconButton>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  compactHeader: {
    minHeight: 60,
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 14,
    alignItems: 'center',
  },
  title: {
    color: colors.textDark,
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 20,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 3,
    fontWeight: '700',
    textAlign: 'center',
  },
  hiddenButton: {
    opacity: 0,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryColor,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
  },
});

export default AppHeader;
