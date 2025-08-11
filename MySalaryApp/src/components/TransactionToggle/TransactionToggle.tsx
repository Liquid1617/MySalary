import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';

export type TransactionViewType = 'recent' | 'future';

interface TransactionToggleProps {
  activeView: TransactionViewType;
  onViewChange: (view: TransactionViewType) => void;
}

export const TransactionToggle: React.FC<TransactionToggleProps> = ({
  activeView,
  onViewChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          styles.leftButton,
          activeView === 'recent' && styles.activeButton,
        ]}
        onPress={() => onViewChange('recent')}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.toggleText,
            activeView === 'recent' && styles.activeText,
          ]}>
          Recent
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.toggleButton,
          styles.rightButton,
          activeView === 'future' && styles.activeButton,
        ]}
        onPress={() => onViewChange('future')}
        activeOpacity={0.7}>
        <Text
          style={[
            styles.toggleText,
            activeView === 'future' && styles.activeText,
          ]}>
          Future
        </Text>
      </TouchableOpacity>
    </View>
  );
};