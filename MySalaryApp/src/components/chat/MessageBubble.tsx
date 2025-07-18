import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Markdown from 'react-native-markdown-display';
import { chatTokens } from '../../styles/tokens/chat';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error' | 'streaming';
  isFirstInGroup?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onRetry?: () => void;
  onLongPress?: () => void;
  showAvatar?: boolean;
  maxWidth?: number;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRetry,
  onLongPress,
  showAvatar = true,
  maxWidth = Dimensions.get('window').width * chatTokens.dimensions.bubbleMaxWidth,
}) => {
  const isAI = message.sender === 'ai';
  const isError = message.status === 'error';
  const isStreaming = message.status === 'streaming';

  const renderAvatar = () => {
    if (!isAI || !showAvatar || !message.isFirstInGroup) return null;
    
    return (
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>AI</Text>
      </View>
    );
  };

  const renderErrorActions = () => {
    if (!isError || !onRetry) return null;
    
    return (
      <TouchableOpacity
        style={styles.retryButton}
        onPress={onRetry}
        accessibilityLabel="Retry message"
        accessibilityRole="button">
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    );
  };

  const renderStreamingIndicator = () => {
    if (!isStreaming) return null;
    
    return <View style={styles.streamingCaret} />;
  };

  const getBubbleStyle = () => {
    if (isError) {
      return [styles.bubble, styles.errorBubble];
    }
    
    return [
      styles.bubble,
      isAI ? styles.aiBubble : styles.userBubble,
      isStreaming && styles.streamingBubble,
    ];
  };

  const getTextStyle = () => {
    return [
      styles.messageText,
      isAI ? styles.aiText : styles.userText,
      isStreaming && styles.streamingText,
    ];
  };

  return (
    <View style={[styles.container, isAI ? styles.aiContainer : styles.userContainer]}>
      {renderAvatar()}
      
      <TouchableOpacity
        style={[styles.bubbleContainer, { maxWidth: '76%' }]}
        onLongPress={onLongPress}
        accessibilityRole="text"
        accessibilityHint="Long press for options"
        disabled={!onLongPress}
        activeOpacity={onLongPress ? 0.7 : 1}>
        
        {isError && (
          <View style={styles.errorIcon}>
            <FontAwesome5 name="exclamation-triangle" size={12} color={chatTokens.colors.error} />
          </View>
        )}
        
        <View style={getBubbleStyle()}>
          {isAI ? (
            <>
              {message.text && message.text.trim() ? (
                <Markdown style={markdownStyles}>
                  {message.text}
                </Markdown>
              ) : (
                <Text style={getTextStyle()}>
                  {message.text}
                </Text>
              )}
              {renderStreamingIndicator()}
            </>
          ) : (
            <Text style={getTextStyle()}>
              {message.text}
              {renderStreamingIndicator()}
            </Text>
          )}
        </View>
        
        {renderErrorActions()}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4, // 4pt within blocks
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: chatTokens.colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: chatTokens.colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  bubbleContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: chatTokens.dimensions.bubblePadding.horizontal,
    paddingVertical: chatTokens.dimensions.bubblePadding.vertical,
    borderRadius: chatTokens.borderRadius.bubble,
  },
  aiBubble: {
    backgroundColor: chatTokens.colors.aiBubble,
  },
  userBubble: {
    backgroundColor: chatTokens.colors.userBubble,
  },
  errorBubble: {
    backgroundColor: chatTokens.colors.errorBubble,
  },
  streamingBubble: {
    opacity: 0.8,
  },
  messageText: {
    ...chatTokens.typography.messageText,
  },
  aiText: {
    color: chatTokens.colors.aiText,
  },
  userText: {
    color: chatTokens.colors.userText,
  },
  streamingText: {
    opacity: 0.6,
  },
  streamingCaret: {
    width: 2,
    height: 16,
    backgroundColor: chatTokens.colors.textPrimary,
    marginLeft: 2,
    opacity: 0.6,
  },
  errorIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: chatTokens.spacing.xs,
  },
  retryButton: {
    marginTop: chatTokens.spacing.xs,
    paddingVertical: chatTokens.spacing.xs,
  },
  retryText: {
    fontSize: 14,
    color: chatTokens.colors.primary,
    fontWeight: '500',
  },
});

const markdownStyles = {
  body: {
    fontSize: chatTokens.typography.messageText.fontSize,
    lineHeight: chatTokens.typography.messageText.lineHeight,
    color: chatTokens.colors.aiText,
    margin: 0,
    padding: 0,
    minHeight: 0,
  },
  paragraph: {
    fontSize: chatTokens.typography.messageText.fontSize,
    lineHeight: chatTokens.typography.messageText.lineHeight,
    color: chatTokens.colors.aiText,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  strong: {
    color: chatTokens.colors.aiText,
    fontWeight: '600',
  },
  em: {
    color: chatTokens.colors.aiText,
    fontStyle: 'italic',
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700',
    color: chatTokens.colors.aiText,
    marginTop: 4,
    marginBottom: 4,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600',
    color: chatTokens.colors.aiText,
    marginTop: 4,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    color: chatTokens.colors.aiText,
    marginTop: 4,
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: chatTokens.colors.backgroundSubtle,
    color: chatTokens.colors.aiText,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: 'Monaco',
  },
  code_block: {
    backgroundColor: chatTokens.colors.backgroundSubtle,
    color: chatTokens.colors.aiText,
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'Monaco',
    marginTop: 4,
    marginBottom: 4,
  },
  fence: {
    backgroundColor: chatTokens.colors.backgroundSubtle,
    color: chatTokens.colors.aiText,
    padding: 8,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'Monaco',
    marginTop: 4,
    marginBottom: 4,
  },
  bullet_list: {
    marginTop: 4,
    marginBottom: 4,
  },
  ordered_list: {
    marginTop: 4,
    marginBottom: 4,
  },
  list_item: {
    color: chatTokens.colors.aiText,
    fontSize: chatTokens.typography.messageText.fontSize,
    lineHeight: chatTokens.typography.messageText.lineHeight,
    marginBottom: 2,
  },
  bullet_list_icon: {
    color: chatTokens.colors.aiText,
    fontSize: 16,
    marginRight: 4,
  },
  ordered_list_icon: {
    color: chatTokens.colors.aiText,
    fontSize: chatTokens.typography.messageText.fontSize,
    marginRight: 4,
  },
};