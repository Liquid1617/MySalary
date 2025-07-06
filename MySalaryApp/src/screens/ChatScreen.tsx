import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { deepSeekService, ChatMessage } from '../services/deepseek';
import { chatScreenStyles } from '../styles';
import { TypingIndicator } from '../components/TypingIndicator';

interface ChatScreenProps {
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const suggestions = [
    'Помоги составить бюджет на месяц',
    'Как сократить расходы на еду?',
    'Сколько нужно откладывать на экстренный фонд?',
    'Проанализируй мои траты за последний месяц',
    'Как правильно планировать крупные покупки?',
  ];

  useEffect(() => {
    // Добавляем приветственное сообщение
    const welcomeMessage: ChatMessage = {
      id: deepSeekService.generateMessageId(),
      content:
        'Привет! 👋 Я ваш персональный финансовый помощник. Готов помочь вам с планированием бюджета, анализом расходов и достижением финансовых целей. О чем хотите поговорить?',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: deepSeekService.generateMessageId(),
      content: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await deepSeekService.sendMessage(inputText.trim());

      const aiMessage: ChatMessage = {
        id: deepSeekService.generateMessageId(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Не удалось отправить сообщение. Проверьте подключение к интернету.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const clearChat = () => {
    Alert.alert(
      'Очистить чат',
      'Вы уверены, что хотите очистить историю чата?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => {
            deepSeekService.clearHistory();
            const welcomeMessage: ChatMessage = {
              id: deepSeekService.generateMessageId(),
              content:
                'Привет! 👋 Я ваш персональный финансовый помощник. Готов помочь вам с планированием бюджета, анализом расходов и достижением финансовых целей. О чем хотите поговорить?',
              isUser: false,
              timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
            setError(null);
          },
        },
      ],
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        chatScreenStyles.messageContainer,
        item.isUser
          ? chatScreenStyles.userMessageContainer
          : chatScreenStyles.aiMessageContainer,
      ]}>
      <View
        style={[
          chatScreenStyles.messageBubble,
          item.isUser
            ? chatScreenStyles.userMessageBubble
            : chatScreenStyles.aiMessageBubble,
        ]}>
        <Text
          style={[
            chatScreenStyles.messageText,
            item.isUser
              ? chatScreenStyles.userMessageText
              : chatScreenStyles.aiMessageText,
          ]}>
          {item.content}
        </Text>
      </View>
      <Text style={chatScreenStyles.timestampText}>
        {formatTime(item.timestamp)}
      </Text>
    </View>
  );

  const renderSuggestions = () => (
    <View style={chatScreenStyles.suggestions}>
      <Text style={chatScreenStyles.suggestionsTitle}>
        Попробуйте спросить:
      </Text>
      {suggestions.map((suggestion, index) => (
        <TouchableOpacity
          key={index}
          style={chatScreenStyles.suggestionItem}
          onPress={() => handleSuggestionPress(suggestion)}>
          <Text style={chatScreenStyles.suggestionText}>{suggestion}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTypingIndicator = () => (
    <TypingIndicator style={{ paddingHorizontal: 16 }} />
  );

  return (
    <SafeAreaView style={chatScreenStyles.container}>
      <KeyboardAvoidingView
        style={chatScreenStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={chatScreenStyles.header}>
          <Text style={chatScreenStyles.headerTitle}>Финансовый AI 🤖</Text>
          <TouchableOpacity
            style={chatScreenStyles.clearButton}
            onPress={clearChat}>
            <Text style={chatScreenStyles.clearButtonText}>Очистить</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <View style={chatScreenStyles.messagesContainer}>
          {messages.length === 1 ? (
            <ScrollView
              style={chatScreenStyles.messagesList}
              showsVerticalScrollIndicator={false}>
              {renderMessage({ item: messages[0] })}
              {renderSuggestions()}
            </ScrollView>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id}
              style={chatScreenStyles.messagesList}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                if (flatListRef.current) {
                  flatListRef.current.scrollToEnd({ animated: true });
                }
              }}
            />
          )}

          {isLoading && renderTypingIndicator()}
        </View>

        {/* Error */}
        {error && (
          <View style={chatScreenStyles.errorContainer}>
            <Text style={chatScreenStyles.errorText}>{error}</Text>
          </View>
        )}

        {/* Input */}
        <View style={chatScreenStyles.inputContainer}>
          <TextInput
            style={chatScreenStyles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Напишите сообщение..."
            placeholderTextColor="#8E8E93"
            multiline
            maxLength={500}
            editable={!isLoading}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              chatScreenStyles.sendButton,
              (!inputText.trim() || isLoading) &&
              chatScreenStyles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}>
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={chatScreenStyles.sendButtonText}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
