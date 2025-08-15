import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchIcon } from '../icons/SearchIcon';
import { TempoAIIcon } from '../icons/TempoAIIcon';
import { CloseIcon } from '../icons/CloseIcon';

interface ChatHeaderProps {
  onClose: () => void;
  onSearch?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  onSearch,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Left block - Search icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onSearch}
          accessibilityLabel="Search"
          accessibilityRole="button"
          activeOpacity={0.7}>
          <SearchIcon size={24} color="#252233" />
        </TouchableOpacity>
        
        {/* Middle block - Tempo AI icon and text */}
        <View style={styles.centerBlock}>
          <TempoAIIcon size={24} color="#252233" />
          <Text style={styles.title}>Tempo AI</Text>
        </View>
        
        {/* Right block - Close icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onClose}
          accessibilityLabel="Close chat"
          accessibilityRole="button"
          activeOpacity={0.7}>
          <CloseIcon size={24} color="#252233" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 75, // Отступ до контента от самого верха экрана
    paddingRight: 12,
    paddingBottom: 16,
    paddingLeft: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    opacity: 1,
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'Commissioner',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14, // 100% line height
    letterSpacing: 0,
    color: '#252233',
  },
});