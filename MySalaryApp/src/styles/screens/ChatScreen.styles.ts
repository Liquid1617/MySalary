import { StyleSheet } from 'react-native';
import { colors } from '../colors';

export const chatScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.background,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },

  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
  },

  clearButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },

  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  messagesList: {
    paddingVertical: 8,
  },

  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },

  userMessageContainer: {
    alignSelf: 'flex-end',
  },

  aiMessageContainer: {
    alignSelf: 'flex-start',
  },

  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 40,
    justifyContent: 'center',
  },

  userMessageBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },

  aiMessageBubble: {
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },

  userMessageText: {
    color: colors.white,
  },

  aiMessageText: {
    color: colors.text,
  },

  timestampText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: colors.disabled,
  },

  sendButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },

  errorContainer: {
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },

  errorText: {
    color: colors.white,
    fontSize: 14,
    textAlign: 'center',
  },

  suggestions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },

  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  suggestionText: {
    fontSize: 14,
    color: colors.text,
  },

  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textSecondary,
    marginRight: 4,
  },

  typingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
});
