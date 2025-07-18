import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatTokens } from '../../styles/tokens/chat';

export type InputState = 'idle' | 'streaming' | 'error';

interface SimpleInputTrayProps {
  onSend: (message: string) => void;
  onRetry?: () => void;
  onResetError?: () => void;
  state: InputState;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}

const DRAFT_KEY = 'chat-draft';

export const SimpleInputTray: React.FC<SimpleInputTrayProps> = ({
  onSend,
  onRetry,
  onResetError,
  state,
  placeholder = 'Сообщение…',
  maxLength = 1000,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(48);
  const textInputRef = useRef<TextInput>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  // Save draft on text change
  useEffect(() => {
    saveDraft(text);
  }, [text]);

  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_KEY);
      if (draft) {
        setText(draft);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async (value: string) => {
    try {
      if (value.trim()) {
        await AsyncStorage.setItem(DRAFT_KEY, value);
      } else {
        await AsyncStorage.removeItem(DRAFT_KEY);
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  const handleSend = () => {
    if (text.trim() && state !== 'streaming') {
      onSend(text.trim());
      setText('');
      clearDraft();
      setInputHeight(48);
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    
    // Reset error state when user starts typing a new message
    if (value.trim() && state === 'error' && onResetError) {
      onResetError();
    }
  };

  const handleContentSizeChange = (event: any) => {
    const newHeight = Math.max(
      48,
      Math.min(chatTokens.dimensions.inputMaxHeight, event.nativeEvent.contentSize.height + 16)
    );
    setInputHeight(newHeight);
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonIcon = () => {
    switch (state) {
      case 'streaming':
        return 'stop';
      case 'error':
        return 'redo';
      default:
        return 'arrow-up';
    }
  };

  const getButtonAction = () => {
    switch (state) {
      case 'error':
        return onRetry;
      default:
        return handleSend;
    }
  };

  const getButtonAccessibilityLabel = () => {
    switch (state) {
      case 'streaming':
        return 'Остановить генерацию';
      case 'error':
        return 'Повторить сообщение';
      default:
        return 'Отправить сообщение';
    }
  };

  const isButtonDisabled = () => {
    if (disabled) return true;
    if (state === 'streaming' || state === 'error') return false;
    return !text.trim();
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.sendButton];
    
    if (isButtonDisabled()) {
      baseStyle.push(styles.sendButtonDisabled);
    } else {
      baseStyle.push(styles.sendButtonActive);
    }
    
    return baseStyle;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          ref={textInputRef}
          style={[styles.textInput, { height: inputHeight }]}
          value={text}
          onChangeText={handleTextChange}
          onContentSizeChange={handleContentSizeChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline
          maxLength={maxLength}
          editable={!disabled && state !== 'streaming'}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          textAlignVertical="center"
          accessibilityLabel="Поле ввода сообщения"
          accessibilityHint="Введите ваше сообщение здесь"
        />
        
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={getButtonStyle()}
            onPress={() => {
              animateButton();
              const action = getButtonAction();
              if (action) {
                action();
              }
            }}
            disabled={isButtonDisabled()}
            accessibilityLabel={getButtonAccessibilityLabel()}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <FontAwesome5 
              name={getButtonIcon()} 
              size={16} 
              color={chatTokens.colors.surface} 
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: chatTokens.spacing.lg,
    paddingTop: chatTokens.spacing.sm,
    paddingBottom: chatTokens.spacing.sm + (Platform.OS === 'ios' ? 8 : 0),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: chatTokens.spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: chatTokens.dimensions.inputMaxHeight,
    backgroundColor: chatTokens.colors.backgroundSubtle,
    borderRadius: chatTokens.borderRadius.xl,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.md,
    fontSize: chatTokens.typography.placeholderText.fontSize,
    lineHeight: chatTokens.typography.placeholderText.lineHeight,
    color: chatTokens.colors.textPrimary,
    textAlignVertical: 'center',
    ...Platform.select({
      ios: {
        paddingTop: 14,
        paddingBottom: 14,
      },
      android: {
        paddingTop: 12,
        paddingBottom: 12,
      },
    }),
  },
  sendButton: {
    width: chatTokens.dimensions.buttonSize,
    height: chatTokens.dimensions.buttonSize,
    borderRadius: chatTokens.dimensions.buttonSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#0066FF',
  },
  sendButtonDisabled: {
    backgroundColor: '#BFC4CC',
  },
});