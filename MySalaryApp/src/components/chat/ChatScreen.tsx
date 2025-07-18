import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  FlatList,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { chatTokens } from '../../styles/tokens/chat';
import { deepSeekService } from '../../services/deepseek';
import {
  ChatHeader,
  MessageBubble,
  InputTray,
  ScrollToBottomFAB,
  DateDivider,
  AttachSheet,
  Message,
  InputState,
} from './index';

interface ChatScreenProps {
  visible: boolean;
  onClose: () => void;
}

type ChatState = {
  messages: Message[];
  status: InputState;
  currentStreamingMessageId?: string;
};

export const ChatScreen: React.FC<ChatScreenProps> = ({ visible, onClose }) => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: `initial-${Date.now()}`,
        text: "Hey! 👋 I'm your personal financial assistant. Ready to help you with budget planning, expense analysis, and achieving your financial goals. What would you like to talk about?",
        sender: 'ai',
        timestamp: new Date(),
        isFirstInGroup: true,
      },
    ],
    status: 'idle',
  });
  
  const [attachSheetVisible, setAttachSheetVisible] = useState(false);
  const [showScrollFAB, setShowScrollFAB] = useState(false);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const { height: screenHeight } = Dimensions.get('window');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Group messages by date and sender
  const groupedMessages = useCallback(() => {
    const grouped: any[] = [];
    let currentDate = '';
    let currentSender = '';
    
    chatState.messages.forEach((message, index) => {
      const messageDate = message.timestamp.toDateString();
      
      // Add date divider if date changed
      if (messageDate !== currentDate) {
        // Add 12pt spacing before new date group
        if (grouped.length > 0) {
          grouped.push({
            type: 'spacer',
            id: `spacer-${messageDate}-${index}`,
            height: 12,
          });
        }
        
        grouped.push({
          type: 'date',
          id: `date-${messageDate}-${index}`,
          date: message.timestamp,
        });
        currentDate = messageDate;
        currentSender = ''; // Reset sender grouping on new date
      }
      
      // Mark first message in group
      const isFirstInGroup = message.sender !== currentSender;
      
      // Add 12pt spacing between different sender groups
      if (isFirstInGroup && grouped.length > 0 && currentSender !== '') {
        grouped.push({
          type: 'spacer',
          id: `spacer-${message.id}`,
          height: 12,
        });
      }
      
      grouped.push({
        type: 'message',
        ...message,
        isFirstInGroup,
        id: `message-${message.id}`, // Ensure unique id
      });
      
      currentSender = message.sender;
    });
    
    return grouped;
  }, [chatState.messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (visible && chatState.messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, chatState.messages.length]);

  // Handle scroll events for FAB visibility
  const handleScroll = useCallback((event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom = contentOffset.y > contentSize.height - layoutMeasurement.height * 1.5;
    setShowScrollFAB(!isNearBottom);
  }, []);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

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

  const animateError = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: chatTokens.animations.shakeAnimation.amplitude,
        duration: chatTokens.animations.shakeAnimation.duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -chatTokens.animations.shakeAnimation.amplitude,
        duration: chatTokens.animations.shakeAnimation.duration / 2,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: chatTokens.animations.shakeAnimation.duration / 2,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessageId = addMessage({
      text: text.trim(),
      sender: 'user',
      status: 'sent',
    });
    
    // Add streaming AI message
    const aiMessageId = addMessage({
      text: '',
      sender: 'ai',
      status: 'streaming',
    });
    
    setChatState(prev => ({
      ...prev,
      status: 'streaming',
      currentStreamingMessageId: aiMessageId,
    }));
    
    try {
      // Simulate error for testing retry functionality
      if (text.trim().toLowerCase() === 'error') {
        throw new Error('Test error for retry functionality');
      }
      
      const response = await deepSeekService.sendMessage(text.trim());
      
      // Update AI message with response
      updateMessage(aiMessageId, {
        text: response,
        status: 'sent',
      });
      
      setChatState(prev => ({
        ...prev,
        status: 'idle',
        currentStreamingMessageId: undefined,
      }));
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Update AI message with error
      updateMessage(aiMessageId, {
        text: 'Sorry, an error occurred. Please try again.',
        status: 'error',
      });
      
      setChatState(prev => ({
        ...prev,
        status: 'error',
        currentStreamingMessageId: undefined,
      }));
      
      setRetryMessage(text.trim());
      animateError();
    }
  };

  const handleCancelMessage = () => {
    if (chatState.currentStreamingMessageId) {
      // Remove streaming message
      setChatState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== prev.currentStreamingMessageId),
        status: 'idle',
        currentStreamingMessageId: undefined,
      }));
    }
  };

  const handleRetryMessage = () => {
    if (retryMessage) {
      // Reset error state first
      setChatState(prev => ({
        ...prev,
        status: 'idle',
      }));
      
      // Then send the retry message
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
    // Find the user message before this error message
    const messageIndex = chatState.messages.findIndex(msg => msg.id === messageId);
    if (messageIndex > 0) {
      const userMessage = chatState.messages[messageIndex - 1];
      if (userMessage.sender === 'user') {
        // Reset error state first
        setChatState(prev => ({
          ...prev,
          status: 'idle',
        }));
        
        // Remove the error message
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.filter(msg => msg.id !== messageId),
        }));
        
        // Retry with the user message
        handleSendMessage(userMessage.text);
      }
    }
  };

  const handleMessageLongPress = (message: Message) => {
    Alert.alert(
      'Message Options',
      `Message from ${message.sender}`,
      [
        { text: 'Copy', onPress: () => {/* Copy implementation */} },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'date') {
      return <DateDivider date={item.date} />;
    }
    
    if (item.type === 'spacer') {
      return <View style={{ height: item.height }} />;
    }
    
    return (
      <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
        <MessageBubble
          message={item}
          onRetry={item.status === 'error' ? () => handleRetryBubble(item.id) : undefined}
          onLongPress={() => handleMessageLongPress(item)}
          showAvatar={item.sender === 'ai'}
        />
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <LinearGradient
        colors={[chatTokens.colors.gradientStart, chatTokens.colors.gradientEnd]}
        locations={[0, 0.22]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.22 }}
        style={styles.container}>
        <SafeAreaView style={styles.container}>
          <ChatHeader onClose={onClose} />
          
          <View style={styles.messagesContainer}>
            <FlatList
              ref={flatListRef}
              data={groupedMessages()}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10,
              }}
            />
            
            <ScrollToBottomFAB
              visible={showScrollFAB}
              onPress={scrollToBottom}
              bottom={chatTokens.dimensions.inputMinHeight + 80}
              right={chatTokens.spacing.lg}
            />
          </View>
          
          <InputTray
            onSend={handleSendMessage}
            onAttach={() => setAttachSheetVisible(true)}
            onCancel={handleCancelMessage}
            onRetry={handleRetryMessage}
            onResetError={handleResetError}
            state={chatState.status}
          />
          
        </SafeAreaView>
      </LinearGradient>
      
      <AttachSheet
        visible={attachSheetVisible}
        onClose={() => setAttachSheetVisible(false)}
        onPickDocument={() => console.log('Pick document')}
        onLaunchCamera={() => console.log('Launch camera')}
        onOpenTemplates={() => console.log('Open templates')}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    position: 'relative',
  },
  messagesContent: {
    paddingHorizontal: chatTokens.spacing.lg,
    paddingVertical: chatTokens.spacing.md,
    flexGrow: 1,
  },
});