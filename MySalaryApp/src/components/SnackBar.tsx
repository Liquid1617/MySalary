import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

interface SnackBarProps {
  visible: boolean;
  message: string;
  onUndo?: () => void;
  onDismiss: () => void;
  duration?: number; // milliseconds
}

const { width: screenWidth } = Dimensions.get('window');

export const SnackBar: React.FC<SnackBarProps> = ({
  visible,
  message,
  onUndo,
  onDismiss,
  duration = 5000,
}) => {
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      // Animate in
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        hideSnackBar();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideSnackBar();
    }
  }, [visible]);

  const hideSnackBar = () => {
    translateY.value = withSpring(100, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished) {
        runOnJS(setIsVisible)(false);
        runOnJS(onDismiss)();
      }
    });
  };

  const handleUndo = () => {
    if (onUndo) {
      onUndo();
    }
    hideSnackBar();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  if (!isVisible && !visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
        {onUndo && (
          <TouchableOpacity
            style={styles.undoButton}
            onPress={handleUndo}
            activeOpacity={0.7}>
            <Text style={styles.undoText}>Undo</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // Above tab bar
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  content: {
    backgroundColor: 'rgba(50, 50, 50, 0.95)',
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 15,
    flex: 1,
    marginRight: 16,
  },
  undoButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  undoText: {
    color: '#4CD964',
    fontSize: 15,
    fontWeight: '600',
  },
});