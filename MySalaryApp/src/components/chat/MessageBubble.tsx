import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Markdown from 'react-native-markdown-display';
import { chatTokens } from '../../styles/tokens/chat';
import { MediaFile } from '../../utils/imagePickerUtils';
import { MediaPreview } from './MediaPreview';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error' | 'streaming';
  isFirstInGroup?: boolean;
  mediaFiles?: MediaFile[];
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
  maxWidth = 320,
}) => {
  const isAI = message.sender === 'ai';
  const isError = message.status === 'error';
  const isStreaming = message.status === 'streaming';

  // Уменьшаем максимальную ширину для сообщений с медиафайлами
  const hasMedia = message.mediaFiles && message.mediaFiles.length > 0;
  const adjustedMaxWidth =
    hasMedia && !isAI
      ? Dimensions.get('window').width * 0.8 // 80% для сообщений с медиа
      : maxWidth;

  const renderAvatar = () => {
    return null;
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

  const renderTimestamp = () => {
    const time = message.timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return <Text style={styles.timestamp}>{time}</Text>;
  };

  const getBubbleStyle = () => {
    if (isError) {
      return [styles.bubble, styles.errorBubble];
    }

    const baseStyles = [
      styles.bubble,
      isAI ? styles.aiBubble : styles.userBubble,
      isStreaming && styles.streamingBubble,
    ];

    // Если есть только медиа без текста, уменьшаем padding
    if (hasMedia && !message.text?.trim() && !isAI) {
      baseStyles.push(styles.mediaOnlyBubble);
    }

    return baseStyles;
  };

  const getTextStyle = () => {
    return [
      styles.messageText,
      isAI ? styles.aiText : styles.userText,
      isStreaming && styles.streamingText,
    ];
  };

  return (
    <View
      style={[
        styles.container,
        isAI ? styles.aiContainer : styles.userContainer,
        hasMedia && !isAI && styles.userContainerWithMedia,
      ]}>
      {renderAvatar()}

      <TouchableOpacity
        style={[
          styles.bubbleContainer,
          { maxWidth: hasMedia && !isAI ? maxWidth * 0.85 : maxWidth },
        ]}
        onLongPress={onLongPress}
        accessibilityRole="text"
        accessibilityHint="Long press for options"
        disabled={!onLongPress}
        activeOpacity={onLongPress ? 0.7 : 1}>
        {isError && (
          <View style={styles.errorIcon}>
            <FontAwesome5
              name="exclamation-triangle"
              size={12}
              color={chatTokens.colors.error}
            />
          </View>
        )}

        <View style={getBubbleStyle()}>
          {isAI ? (
            <>
              {message.text && message.text.trim() ? (
                <Markdown style={markdownStyles}>{message.text}</Markdown>
              ) : (
                <Text style={getTextStyle()}>{message.text}</Text>
              )}
              {renderStreamingIndicator()}
              <View style={styles.timestampContainer}>{renderTimestamp()}</View>
            </>
          ) : (
            <View style={styles.userMessageContainer}>
              {message.mediaFiles && message.mediaFiles.length > 0 && (
                <View
                  style={[
                    styles.mediaContainer,
                    !message.text?.trim() && { marginBottom: 0 },
                  ]}>
                  <MediaPreview mediaFiles={message.mediaFiles} />
                </View>
              )}
              {message.text && message.text.trim() ? (
                <View style={styles.messageRow}>
                  <View style={styles.messageContent}>
                    <Text style={getTextStyle()}>
                      {message.text}
                      {renderStreamingIndicator()}
                    </Text>
                  </View>
                  <View style={styles.timestampWrapper}>
                    {renderTimestamp()}
                  </View>
                </View>
              ) : (
                <View style={styles.timestampContainer}>
                  {renderTimestamp()}
                </View>
              )}
            </View>
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
    marginVertical: 8,
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  userContainerWithMedia: {
    marginRight: 36,
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
    position: 'relative',
  },
  bubble: {
    paddingHorizontal: chatTokens.dimensions.bubblePadding.horizontal,
    paddingVertical: chatTokens.dimensions.bubblePadding.vertical,
    borderRadius: chatTokens.borderRadius.bubble,
  },
  aiBubble: {
    backgroundColor: chatTokens.colors.aiBubble,
    ...chatTokens.shadows.aiBubble,
  },
  userBubble: {
    backgroundColor: chatTokens.colors.userBubble,
    borderBottomRightRadius: 4,
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
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageContent: {
    flexShrink: 1,
  },
  timestampWrapper: {
    marginLeft: 8,
    alignSelf: 'flex-end',
  },
  timestampContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontFamily: 'Commissioner',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#D3D6D7',
  },
  userMessageContainer: {
    width: '100%' as const,
  },
  mediaContainer: {
    marginBottom: 6,
  },
  mediaOnlyBubble: {
    paddingHorizontal: chatTokens.dimensions.bubblePadding.horizontal,
    paddingVertical: 2,
    borderRadius: chatTokens.borderRadius.bubble,
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
    fontWeight: '600' as const,
  },
  em: {
    color: chatTokens.colors.aiText,
    fontStyle: 'italic' as const,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: chatTokens.colors.aiText,
    marginTop: 4,
    marginBottom: 4,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: chatTokens.colors.aiText,
    marginTop: 4,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600' as const,
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
  userMessageContainer: {
    width: '100%' as const,
  },
  mediaContainer: {
    marginBottom: 6,
  },
  mediaOnlyBubble: {
    paddingTop: 6,
    paddingBottom: 8,
  },
  messageTail: {
    position: 'absolute' as const,
    bottom: 0,
    right: -6,
    width: 12,
    height: 12,
    borderTopLeftRadius: 12,
  },
};
