import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PlusIcon } from '../icons/PlusIcon';
import { SendArrowIcon } from '../icons/SendArrowIcon';
import { AttachmentMenu } from './AttachmentMenu';
import { MediaPreviewScreen } from './MediaPreviewScreen';
import { MediaFile } from '../../utils/imagePickerUtils';

interface StyledInputTrayProps {
  value: string;
  onChangeText: (text: string) => void;
  onSendPress: (text: string, mediaFiles?: MediaFile[]) => void;
  onDocumentPress?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const StyledInputTray: React.FC<StyledInputTrayProps> = ({
  value,
  onChangeText,
  onSendPress,
  onDocumentPress = () => {},
  placeholder = "Message",
  disabled = false
}) => {
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [inputHeight, setInputHeight] = useState(60);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 12 });
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const screenWidth = Dimensions.get('window').width;
  const containerRef = useRef<View>(null);

  const handleAttachPress = () => {
    // Calculate position above the input tray
    containerRef.current?.measureInWindow((_, y) => {
      setMenuPosition({
        top: y - 88 - 3, // 88px menu height + 3px gap above input
        left: 12
      });
    });
    
    setShowAttachmentMenu(true);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePhotoSelection = () => {
    setShowMediaPreview(true);
  };

  const handleMediaPreviewSend = (text: string, mediaFiles: MediaFile[]) => {
    onSendPress(text, mediaFiles);
  };

  const handleSendPress = () => {
    if (value.trim()) {
      onSendPress(value);
    }
  };

  const inputWidth = screenWidth - 12 - 46 - 8 - 12; // screen - leftMargin - buttonWidth - gap - rightMargin

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputRow} ref={containerRef}>
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAttachPress}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <PlusIcon width={24} height={24} color="#252233" />
          </TouchableOpacity>
        </Animated.View>

        <View style={[styles.inputContainer, { width: inputWidth }]}>
          <View style={[styles.textInputWrapper, { height: Math.max(60, inputHeight) }]}>
            <TextInput
              style={[styles.textInput, { paddingLeft: 18 }]}
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor="#D3D6D7"
              multiline
              editable={!disabled}
              onContentSizeChange={(event) => {
                setInputHeight(event.nativeEvent.contentSize.height + 40); // padding compensation (20 top + 20 bottom)
              }}
            />
          </View>
          
          <View style={styles.sendButtonContainer}>
            <TouchableOpacity
              onPress={handleSendPress}
              disabled={disabled || !value.trim()}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FFFFFF', '#C6C2FF', '#72E1F5', '#53EFAE', '#B5FA01']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.sendButton,
                  (!value.trim() || disabled) && styles.sendButtonDisabled
                ]}
              >
                <SendArrowIcon width={20} height={20} color="#252233" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <AttachmentMenu
        visible={showAttachmentMenu}
        onClose={() => setShowAttachmentMenu(false)}
        onPhotoPress={handlePhotoSelection}
        onDocumentPress={onDocumentPress}
        position={menuPosition}
      />

      <MediaPreviewScreen
        visible={showMediaPreview}
        onClose={() => setShowMediaPreview(false)}
        onSend={handleMediaPreviewSend}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 11,
    backgroundColor: '#FDFDFE',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    position: 'relative',
    minHeight: 60,
  },
  textInputWrapper: {
    borderRadius: 30,
    backgroundColor: '#FDFDFE',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 50, // space for send button
  },
  textInput: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingRight: 0,
    fontFamily: 'Commissioner',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 20,
    color: '#252233',
    textAlignVertical: 'center',
  },
  sendButtonContainer: {
    position: 'absolute',
    right: 6,
    bottom: 6,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    padding: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});