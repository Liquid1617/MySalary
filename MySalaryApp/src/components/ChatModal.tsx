import React from 'react';
import { SimpleChatScreen } from './chat/SimpleChatScreen';

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose }) => {
  return <SimpleChatScreen visible={visible} onClose={onClose} />;
};
