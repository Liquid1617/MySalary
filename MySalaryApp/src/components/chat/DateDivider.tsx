import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { chatTokens } from '../../styles/tokens/chat';

interface DateDividerProps {
  date: Date;
  customText?: string;
}

export const DateDivider: React.FC<DateDividerProps> = ({ date, customText }) => {
  const getDateText = () => {
    if (customText) return customText;
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return 'Today';
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.dateText}>{getDateText()}</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: chatTokens.spacing.lg,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dateText: {
    ...chatTokens.typography.dateText,
    color: chatTokens.colors.textSecondary,
    marginHorizontal: chatTokens.spacing.md,
    textAlign: 'center',
  },
});