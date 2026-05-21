import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { colors, radii, spacing } from '../theme';

type ModalAction = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
};

type AppModalProps = {
  visible: boolean;
  icon?: string;
  title: string;
  message: string;
  primaryAction: ModalAction;
  secondaryAction?: ModalAction;
  onRequestClose?: () => void;
};

const AppModal = ({
  visible,
  icon = 'info-circle',
  title,
  message,
  primaryAction,
  secondaryAction,
  onRequestClose,
}: AppModalProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    statusBarTranslucent
    onRequestClose={onRequestClose ?? primaryAction.onPress}>
    <View style={styles.backdrop}>
      <View style={styles.panel}>
        <View style={styles.iconWrap}>
          <FontAwesome name={icon} size={20} color={colors.white} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          {secondaryAction ? (
            <Pressable
              onPress={secondaryAction.onPress}
              style={[styles.button, styles.ghostButton]}>
              <Text style={styles.ghostText}>{secondaryAction.label}</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={primaryAction.onPress}
            style={[
              styles.button,
              primaryAction.variant === 'danger'
                ? styles.dangerButton
                : styles.primaryButton,
            ]}>
            <Text style={styles.primaryText}>{primaryAction.label}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.46)',
    padding: spacing.xl,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryColor,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.textDark,
    fontSize: 20,
    fontWeight: '900',
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  button: {
    minHeight: 44,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primaryColor,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  ghostButton: {
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  primaryText: {
    color: colors.white,
    fontWeight: '900',
  },
  ghostText: {
    color: colors.textDark,
    fontWeight: '900',
  },
});

export default AppModal;
