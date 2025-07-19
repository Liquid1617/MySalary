import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { BudgetResponse } from '../types/budget';
import { useUserCurrency } from '../hooks/useUserCurrency';
import { formatBudgetCurrency as formatBudgetCurrencyUtil } from '../utils/currencyUtils';

interface BudgetChipProps {
  budget: BudgetResponse;
  onPress: (budget: BudgetResponse) => void;
  onEdit: (budget: BudgetResponse) => void;
  onDelete: (budget: BudgetResponse) => void;
}

export const BudgetChip: React.FC<BudgetChipProps> = ({ 
  budget, 
  onPress, 
  onEdit, 
  onDelete 
}) => {
  const progress = Math.min(budget.percent || 0, 100);
  const isOverBudget = (budget.percent || 0) > 100;
  
  // Progress colors based on percentage
  const getProgressColor = (percent: number) => {
    if (percent > 100) return '#E74C3C'; // Red for over budget
    if (percent >= 80) return '#F1C40F'; // Yellow for 80-100%
    return '#2ECC71'; // Green for 0-80%
  };

  const progressColor = getProgressColor(progress);
  
  // Small donut calculations (24pt diameter)
  const donutSize = 24;
  const strokeWidth = 3;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handlePress = () => {
    onPress(budget);
  };

  const handleLongPress = () => {
    Alert.alert(
      budget.name,
      'Choose an action',
      [
        {
          text: 'Edit',
          onPress: () => onEdit(budget),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Delete Budget',
              'Are you sure you want to delete this budget?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => onDelete(budget),
                },
              ]
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const { formatCurrency } = useUserCurrency();

  const formatBudgetCurrency = (amount: number) => {
    if (!budget?.currency) return formatCurrency(amount);
    return formatBudgetCurrencyUtil(amount, budget.currency, formatCurrency);
  };

  const displayProgress = isOverBudget ? Math.round(budget.percent || 0) : Math.round(progress);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${budget.name}. Spent ${formatBudgetCurrency(budget.spent || 0)} of ${formatBudgetCurrency(budget.limit_amount)}. ${displayProgress}%`}
    >
      {/* Small Donut Chart - Top Left */}
      <View style={styles.donutContainer}>
        <Svg width={donutSize} height={donutSize}>
          {/* Background circle */}
          <Circle
            cx={donutSize / 2}
            cy={donutSize / 2}
            r={radius}
            stroke="#E5E5EA"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={donutSize / 2}
            cy={donutSize / 2}
            r={radius}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}
          />
        </Svg>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {budget.name}
        </Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle} numberOfLines={1}>
          {formatBudgetCurrency(budget.spent || 0)} / {formatBudgetCurrency(budget.limit_amount)}
        </Text>
      </View>

      {/* Progress Percentage - Bottom Right */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: progressColor }]}>
          {displayProgress}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 148,
    height: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
  },
  donutContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  content: {
    marginTop: 32, // Space below donut
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
  },
});