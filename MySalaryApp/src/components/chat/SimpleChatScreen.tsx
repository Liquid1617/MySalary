import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { chatTokens } from '../../styles/tokens/chat';
import { deepSeekService } from '../../services/deepseek';
import { ChatHeader } from './ChatHeader';
import { MessageBubble, Message } from './MessageBubble';
import { StyledInputTray } from './StyledInputTray';
import { DateDivider } from './DateDivider';

interface SimpleChatScreenProps {
  visible: boolean;
  onClose: () => void;
}

type ChatState = {
  messages: Message[];
  status: 'idle' | 'streaming' | 'error';
};

type ListItem = 
  | { type: 'message'; data: Message }
  | { type: 'divider'; data: { id: string; date: Date } };

export const SimpleChatScreen: React.FC<SimpleChatScreenProps> = ({ visible, onClose }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: `initial-${Date.now()}`,
        text: "Hi! 👋 I'm your **personal financial assistant**. Ready to help with budget planning, expense analysis, and achieving financial goals. What would you like to discuss?",
        sender: 'ai',
        timestamp: new Date(),
        isFirstInGroup: true,
      },
    ],
    status: 'idle',
  });
  
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  // Group messages by date and create list items with dividers
  const createListItems = (messages: Message[]): ListItem[] => {
    const listItems: ListItem[] = [];
    let currentDate: string | null = null;

    messages.forEach((message) => {
      const messageDate = message.timestamp.toDateString();
      
      // Add date divider if this is a new date
      if (messageDate !== currentDate) {
        listItems.push({
          type: 'divider',
          data: {
            id: `divider-${messageDate}`,
            date: message.timestamp,
          },
        });
        currentDate = messageDate;
      }

      // Add message
      listItems.push({
        type: 'message',
        data: message,
      });
    });

    return listItems;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (visible && chatState.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, chatState.messages.length]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
    
    return newMessage.id;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setChatState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => 
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessageId = addMessage({
      text: text.trim(),
      sender: 'user',
      status: 'sent',
    });
    
    // Add AI message placeholder
    const aiMessageId = addMessage({
      text: '',
      sender: 'ai',
      status: 'streaming',
    });
    
    setChatState(prev => ({
      ...prev,
      status: 'streaming',
    }));
    
    try {
      const response = await deepSeekService.sendMessage(text.trim());
      
      // Update AI message with response
      updateMessage(aiMessageId, {
        text: response,
        status: 'sent',
      });
      
      setChatState(prev => ({
        ...prev,
        status: 'idle',
      }));
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Update AI message with error
      updateMessage(aiMessageId, {
        text: 'Извините, произошла ошибка. Попробуйте еще раз.',
        status: 'error',
      });
      
      setChatState(prev => ({
        ...prev,
        status: 'error',
      }));
      
      setRetryMessage(text.trim());
    }
  };

  const handleRetryMessage = () => {
    if (retryMessage) {
      setChatState(prev => ({
        ...prev,
        status: 'idle',
      }));
      
      handleSendMessage(retryMessage);
      setRetryMessage(null);
    }
  };

  const handleResetError = () => {
    setChatState(prev => ({
      ...prev,
      status: 'idle',
    }));
    setRetryMessage(null);
  };

  const handleRetryBubble = (messageId: string) => {
    const messageIndex = chatState.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0) {
      const userMessage = chatState.messages[messageIndex - 1];
      if (userMessage.sender === 'user') {
        setChatState(prev => ({
          ...prev,
          status: 'idle',
          messages: prev.messages.filter(msg => msg.id !== messageId),
        }));
        
        handleSendMessage(userMessage.text);
      }
    }
  };

  const handleMessageLongPress = (message: Message) => {
    Alert.alert(
      'Опции сообщения',
      `Сообщение от ${message.sender === 'user' ? 'вас' : 'AI'}`,
      [
        { text: 'Скопировать', onPress: () => {/* Copy implementation */} },
        { text: 'Очистить чат', onPress: () => handleClearChat() },
        { text: 'Отмена', style: 'cancel' },
      ]
    );
  };

  const handleClearChat = () => {
    Alert.alert(
      'Очистить чат',
      'Вы уверены, что хотите очистить историю чата?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Очистить', 
          style: 'destructive', 
          onPress: () => {
            // Clear chat history
            deepSeekService.clearHistory();
            setChatState({
              messages: [
                {
                  id: `initial-${Date.now()}`,
                  text: "Hi! 👋 I'm your **personal financial assistant**. Ready to help with budget planning, expense analysis, and achieving financial goals. What would you like to discuss?",
                  sender: 'ai',
                  timestamp: new Date(),
                  isFirstInGroup: true,
                },
              ],
              status: 'idle',
            });
            setRetryMessage(null);
          }
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'divider') {
      return <DateDivider date={item.data.date} />;
    }
    
    const message = item.data;
    return (
      <MessageBubble
        message={message}
        onRetry={message.status === 'error' ? () => handleRetryBubble(message.id) : undefined}
        onLongPress={() => handleMessageLongPress(message)}
        showAvatar={message.sender === 'ai'}
      />
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Base white background */}
        <LinearGradient
          colors={[chatTokens.colors.gradientStart, chatTokens.colors.gradientEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Radial gradient overlay simulation */}
        <LinearGradient
          colors={[
            chatTokens.colors.radialStart,
            chatTokens.colors.radialMiddle,
            chatTokens.colors.radialEnd
          ]}
          locations={[0, 0.3077, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFillObject, styles.radialOverlay]}
        />
        <SafeAreaView style={styles.container}>
          <FlatList
            ref={flatListRef}
            data={createListItems(chatState.messages)}
            renderItem={renderItem}
            keyExtractor={(item) => item.type === 'message' ? item.data.id : item.data.id}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          />
          
          <StyledInputTray
            value={inputText}
            onChangeText={setInputText}
            onSendPress={() => handleSendMessage(inputText).then(() => setInputText(''))}
            onPhotoPress={() => console.log('Photo pressed')}
            onDocumentPress={() => console.log('Document pressed')}
            disabled={chatState.status === 'streaming'}
          />
        </SafeAreaView>
        
        {/* Header positioned above content */}
        <ChatHeader onClose={onClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  radialOverlay: {
    // Empty style to allow combining with absoluteFillObject
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: chatTokens.spacing.lg,
    paddingTop: 70, // Уменьшенный отступ под хэдер
    paddingBottom: chatTokens.spacing.md,
    flexGrow: 1,
  },
});