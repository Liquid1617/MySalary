import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { chatTokens } from '../../styles/tokens/chat';

interface ChatHeaderProps {
  onClose: () => void;
  onMenuPress?: () => void;
  title?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  onMenuPress,
  title = 'Chat with AI',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        accessibilityLabel="Close chat"
        accessibilityRole="button"
        activeOpacity={0.7}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
        <FontAwesome5 
          name="times" 
          size={20} 
          color={chatTokens.colors.textSecondary} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: chatTokens.dimensions.headerHeight,
    paddingHorizontal: chatTokens.spacing.lg,
    backgroundColor: chatTokens.colors.surface,
    ...chatTokens.shadows.header,
    position: 'relative',
  },
  title: {
    ...chatTokens.typography.header,
    color: chatTokens.colors.textPrimary,
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: chatTokens.colors.backgroundSubtle,
    position: 'absolute',
    right: chatTokens.spacing.lg,
    top: (chatTokens.dimensions.headerHeight - 32) / 2,
  },
});