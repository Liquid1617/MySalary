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
    width: '90%',
    alignSelf: 'center',
    zIndex: 1000,
  },
  content: {
    backgroundColor: '#252233E5',
    minHeight: 39,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingRight: 14,
    paddingBottom: 12,
    paddingLeft: 14,
    gap: 10,
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
    fontFamily: 'Commissioner',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  undoButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  undoText: {
    fontFamily: 'Commissioner',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    color: '#10BC74',
  },
});