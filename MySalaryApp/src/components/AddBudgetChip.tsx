import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

interface AddBudgetChipProps {
  onPress: () => void;
}

export const AddBudgetChip: React.FC<AddBudgetChipProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Add new budget"
    >
      <View style={styles.content}>
        <FontAwesome5 
          name="plus" 
          size={24} 
          color="#2E9AFE" 
          style={styles.icon}
        />
        <Text style={styles.text}>Add Budget</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 148,
    height: 96,
    backgroundColor: 'transparent',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2E9AFE',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2E9AFE',
  },
});