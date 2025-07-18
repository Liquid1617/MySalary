import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../styles/colors';

interface TypingIndicatorProps {
  style?: any;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ style }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) {
          return '';
        }
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.messageBubble}>
        <Text style={styles.text}>AI печатает{dots}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginVertical: 4,
    maxWidth: '80%',
  },
  messageBubble: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    minHeight: 40,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
