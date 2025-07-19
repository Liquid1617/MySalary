import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  interpolate,
  withSpring,
} from 'react-native-reanimated';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Transaction } from '../types/transaction';

interface SwipeableTransactionRowProps {
  children: React.ReactNode;
  transaction: Transaction;
  onConfirm: (transaction: Transaction) => void;
  isScheduled: boolean;
}

const ACTIVATION_THRESHOLD = 40;
const AUTO_TRIGGER_THRESHOLD = 88; // 40 + 48
const ACTION_WIDTH = 88;

export const SwipeableTransactionRow: React.FC<SwipeableTransactionRowProps> = ({
  children,
  transaction,
  onConfirm,
  isScheduled,
}) => {
  const translateX = useSharedValue(0);
  const isConfirming = useSharedValue(false);

  const triggerHapticFeedback = () => {
    Vibration.vibrate(50); // 50ms vibration for medium impact
  };

  const handleConfirm = () => {
    onConfirm(transaction);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isConfirming.value = false;
    })
    .onUpdate((event) => {
      // Only allow left swipe (negative translation)
      if (event.translationX < 0 && isScheduled) {
        translateX.value = Math.max(event.translationX, -ACTION_WIDTH);
      }
    })
    .onEnd((event) => {
      if (Math.abs(translateX.value) >= AUTO_TRIGGER_THRESHOLD && isScheduled) {
        // Auto-trigger confirmation
        runOnJS(triggerHapticFeedback)();
        runOnJS(handleConfirm)();
        translateX.value = withSpring(0);
      } else if (Math.abs(translateX.value) >= ACTIVATION_THRESHOLD && isScheduled) {
        // Show action button
        translateX.value = withSpring(-ACTION_WIDTH);
        runOnJS(triggerHapticFeedback)();
      } else {
        // Return to original position
        translateX.value = withSpring(0);
      }
    })
    .enabled(isScheduled);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, ACTIVATION_THRESHOLD],
      [0, 1]
    );
    
    return {
      opacity,
    };
  });

  const handleConfirmPress = () => {
    triggerHapticFeedback();
    handleConfirm();
    translateX.value = withSpring(0);
  };

  return (
    <View style={styles.container}>
      {/* Background Action */}
      <Animated.View style={[styles.background, backgroundStyle]}>
        <TouchableOpacity
          style={styles.action}
          onPress={handleConfirmPress}
          activeOpacity={0.7}>
          <FontAwesome5 name="check" size={20} color="white" />
          <Text style={styles.actionText}>Confirm</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  action: {
    width: ACTION_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});