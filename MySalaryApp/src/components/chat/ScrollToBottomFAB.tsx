import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { chatTokens } from '../../styles/tokens/chat';

interface ScrollToBottomFABProps {
  visible: boolean;
  onPress: () => void;
  bottom?: number;
  right?: number;
}

export const ScrollToBottomFAB: React.FC<ScrollToBottomFABProps> = ({
  visible,
  onPress,
  bottom = 100,
  right = 20,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: chatTokens.animations.fadeIn.duration,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: chatTokens.animations.fadeIn.duration,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom,
          right,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        accessibilityLabel="Scroll to bottom"
        accessibilityRole="button"
        accessibilityHint="Scroll to the latest message">
        <FontAwesome5 
          name="arrow-down" 
          size={20} 
          color={chatTokens.colors.surface} 
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  button: {
    width: chatTokens.dimensions.fabSize,
    height: chatTokens.dimensions.fabSize,
    borderRadius: chatTokens.dimensions.fabSize / 2,
    backgroundColor: chatTokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...chatTokens.shadows.fab,
  },
});