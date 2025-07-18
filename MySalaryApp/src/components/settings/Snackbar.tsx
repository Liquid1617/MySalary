import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { tokens } from '../../styles/tokens';

interface SnackbarProps {
  visible: boolean;
  message: string;
  duration?: number;
  onDismiss?: () => void;
  actionText?: string;
  onActionPress?: () => void;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  message,
  duration = 3000,
  onDismiss,
  actionText,
  onActionPress,
}) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hide();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hide();
    }
  }, [visible]);

  const hide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss?.();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}>
      <Text style={styles.message}>{message}</Text>
      {actionText && (
        <TouchableOpacity onPress={onActionPress} style={styles.action}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: tokens.spacing.lg,
    right: tokens.spacing.lg,
    backgroundColor: tokens.colors.snackbarBg,
    borderRadius: tokens.radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    zIndex: 1000,
  },
  message: {
    flex: 1,
    color: tokens.colors.surface,
    fontSize: 14,
    fontWeight: '400',
  },
  action: {
    marginLeft: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  actionText: {
    color: tokens.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});