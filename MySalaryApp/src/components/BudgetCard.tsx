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

const { width: screenWidth } = Dimensions.get('window');

interface BudgetCardProps {
  budget: BudgetResponse;
  onPress: (budget: BudgetResponse) => void;
  onEdit: (budget: BudgetResponse) => void;
  onDelete: (budget: BudgetResponse) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({ 
  budget, 
  onPress, 
  onEdit, 
  onDelete 
}) => {
  const actualPercent = budget.percent || 0;
  const progress = Math.min(actualPercent, 100); // Cap visual progress at 100%
  const isOverBudget = actualPercent > 100;
  
  // Progress colors based on percentage
  const getProgressColor = (percent: number) => {
    if (percent > 100) return '#FF4C4C'; // Red for over budget
    if (percent >= 80) return '#FFBD2F'; // Yellow for 80-100%
    return '#3FD777'; // Green for 0-80%
  };

  const progressColor = getProgressColor(actualPercent);
  
  // Large donut calculations (72pt diameter)
  const donutSize = 72;
  const strokeWidth = 7;
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

  const formatBudgetAmountOnly = (amount: number) => {
    const absAmount = Math.abs(amount);
    
    if (absAmount >= 1000000000) {
      // Billions: 1.2B, 10B, 100B
      const billions = absAmount / 1000000000;
      if (billions >= 100) {
        return Math.round(billions).toString() + 'B';
      } else if (billions >= 10) {
        return Math.round(billions).toString() + 'B';
      } else {
        return (Math.round(billions * 10) / 10).toString() + 'B';
      }
    } else if (absAmount >= 1000000) {
      // Millions: 1.3M, 10M, 100M
      const millions = absAmount / 1000000;
      if (millions >= 100) {
        return Math.round(millions).toString() + 'M';
      } else if (millions >= 10) {
        return Math.round(millions).toString() + 'M';
      } else {
        return (Math.round(millions * 10) / 10).toString() + 'M';
      }
    } else if (absAmount >= 1000) {
      // Thousands: 1.2K, 10K, 100K
      const thousands = absAmount / 1000;
      if (thousands >= 100) {
        return Math.round(thousands).toString() + 'K';
      } else if (thousands >= 10) {
        return Math.round(thousands).toString() + 'K';
      } else {
        return (Math.round(thousands * 10) / 10).toString() + 'K';
      }
    } else {
      // Less than 1000: show as is
      return Math.round(absAmount).toString();
    }
  };

  const getCurrencySymbol = () => {
    if (!budget?.currency) {
      // Extract symbol from default formatter
      const formatted = formatCurrency(100);
      return formatted.replace(/[\d.,]/g, '').trim();
    }
    // Extract symbol from budget currency formatter
    const formatted = formatBudgetCurrencyUtil(100, budget.currency, formatCurrency);
    return formatted.replace(/[\d.,]/g, '').trim();
  };

  const displayProgress = isOverBudget ? Math.round(budget.percent || 0) : Math.round(progress);

  // Calculate card width: (screen width - padding - gaps) / 3
  const cardWidth = (screenWidth - 48 - 24) / 3; // 24px padding on each side, 12px gap between cards

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${budget.name}. Spent ${formatBudgetCurrency(budget.spent || 0)} of ${formatBudgetCurrency(budget.limit_amount)}. ${displayProgress}%`}
    >
      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {budget.name}
      </Text>
      
      {/* Large Donut Chart with percentage inside */}
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
        {/* Percentage Text Inside Circle */}
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentageText, { color: progressColor }]}>
            {displayProgress}%
          </Text>
        </View>
      </View>

      {/* Amount Text */}
      <Text style={styles.amountText} numberOfLines={1}>
        {formatBudgetAmountOnly(budget.spent || 0)} / {formatBudgetAmountOnly(budget.limit_amount)} {getCurrencySymbol()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  donutContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  percentageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
  },
});