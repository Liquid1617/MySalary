import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { chatTokens } from '../../styles/tokens/chat';

interface AttachSheetProps {
  visible: boolean;
  onClose: () => void;
  onPickDocument?: () => void;
  onLaunchCamera?: () => void;
  onOpenTemplates?: () => void;
}

const { height: screenHeight } = Dimensions.get('window');
const SNAP_POINT_25 = screenHeight * 0.25;
const SNAP_POINT_90 = screenHeight * 0.9;

export const AttachSheet: React.FC<AttachSheetProps> = ({
  visible,
  onClose,
  onPickDocument,
  onLaunchCamera,
  onOpenTemplates,
}) => {
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const currentSnapPoint = useRef(SNAP_POINT_25);

  useEffect(() => {
    if (visible) {
      showSheet();
    } else {
      hideSheet();
    }
  }, [visible]);

  const showSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight - SNAP_POINT_25,
        duration: chatTokens.animations.slideIn.duration,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: chatTokens.animations.slideIn.duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: chatTokens.animations.slideIn.duration,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: chatTokens.animations.slideIn.duration,
        useNativeDriver: true,
      }),
    ]).start(() => {
      currentSnapPoint.current = SNAP_POINT_25;
    });
  };

  const snapToPoint = (point: number) => {
    currentSnapPoint.current = point;
    Animated.timing(translateY, {
      toValue: screenHeight - point,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      const newY = Math.max(
        screenHeight - SNAP_POINT_90,
        Math.min(screenHeight, screenHeight - currentSnapPoint.current + gestureState.dy)
      );
      translateY.setValue(newY);
    },
    onPanResponderRelease: (_, gestureState) => {
      const velocity = gestureState.vy;
      const currentY = screenHeight - currentSnapPoint.current + gestureState.dy;
      
      if (velocity > 0.5 || currentY > screenHeight * 0.6) {
        // Snap down or close
        if (currentSnapPoint.current === SNAP_POINT_90) {
          snapToPoint(SNAP_POINT_25);
        } else {
          onClose();
        }
      } else if (velocity < -0.5 || currentY < screenHeight * 0.4) {
        // Snap up
        if (currentSnapPoint.current === SNAP_POINT_25) {
          snapToPoint(SNAP_POINT_90);
        }
      } else {
        // Snap to current position
        snapToPoint(currentSnapPoint.current);
      }
    },
  });

  const handleOptionPress = (callback?: () => void) => {
    if (callback) {
      callback();
    }
    onClose();
  };

  const renderOption = (
    icon: string,
    label: string,
    onPress?: () => void,
    color: string = chatTokens.colors.textPrimary
  ) => (
    <TouchableOpacity
      style={styles.option}
      onPress={() => handleOptionPress(onPress)}
      accessibilityLabel={label}
      accessibilityRole="button">
      <View style={[styles.optionIcon, { backgroundColor: color + '20' }]}>
        <FontAwesome5 name={icon} size={24} color={color} />
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.container}>
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableOpacity
            style={styles.backdropTouch}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>
        
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
          {...panResponder.panHandlers}>
          <SafeAreaView style={styles.sheetContent}>
            <View style={styles.handle} />
            
            <View style={styles.optionsContainer}>
              {renderOption('paperclip', 'File', onPickDocument, chatTokens.colors.primary)}
              {renderOption('camera', 'Photo', onLaunchCamera, '#FF6B6B')}
              {renderOption('lightbulb', 'Templates', onOpenTemplates, '#4ECDC4')}
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: chatTokens.colors.surface,
    borderTopLeftRadius: chatTokens.borderRadius.lg,
    borderTopRightRadius: chatTokens.borderRadius.lg,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  sheetContent: {
    flex: 1,
    paddingTop: chatTokens.spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: chatTokens.colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: chatTokens.spacing.lg,
  },
  optionsContainer: {
    paddingHorizontal: chatTokens.spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: chatTokens.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: chatTokens.colors.divider,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: chatTokens.spacing.lg,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: chatTokens.colors.textPrimary,
  },
});