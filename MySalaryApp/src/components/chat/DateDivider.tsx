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
      <View style={styles.datePill}>
        <Text style={styles.dateText}>{getDateText()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: chatTokens.spacing.xs,
  },
  datePill: {
    width: 68,
    height: 27,
    gap: 10,
    opacity: 1,
    borderRadius: 20,
    paddingTop: 6,
    paddingRight: 10,
    paddingBottom: 6,
    paddingLeft: 10,
    backgroundColor: 'rgba(211, 214, 215, 0.2)', // #D3D6D733 = 20% opacity
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontFamily: 'Commissioner',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 12, // 100% line height
    letterSpacing: 0,
    color: '#C4C6C7',
    textAlign: 'center',
  },
});