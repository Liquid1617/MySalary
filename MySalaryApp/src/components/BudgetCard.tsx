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
  onDelete,
}) => {
  const actualPercent = budget.percent || 0;
  const progress = Math.min(actualPercent, 100); // Cap visual progress at 100%
  const isOverBudget = actualPercent > 100;

  // Progress colors - always use #53EFAE
  const getProgressColor = () => {
    return '#53EFAE'; // Always green color
  };

  const progressColor = getProgressColor();

  const handlePress = () => {
    onPress(budget);
  };

  const handleLongPress = () => {
    Alert.alert(budget.name, 'Choose an action', [
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
            ],
          );
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
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
    const formatted = formatBudgetCurrencyUtil(
      100,
      budget.currency,
      formatCurrency,
    );
    return formatted.replace(/[\d.,]/g, '').trim();
  };

  const displayProgress = isOverBudget
    ? Math.round(budget.percent || 0)
    : Math.round(progress);

  // Calculate card width with maximum of 202px
  const cardWidth = Math.min(202, screenWidth - 48);

  // Smaller donut for horizontal layout
  const horizontalDonutSize = 30;
  const horizontalStrokeWidth = 3;
  const horizontalRadius = (horizontalDonutSize - horizontalStrokeWidth) / 2;
  const horizontalCircumference = 2 * Math.PI * horizontalRadius;
  const horizontalStrokeDasharray = horizontalCircumference;
  const horizontalStrokeDashoffset =
    horizontalCircumference - (progress / 100) * horizontalCircumference;

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${budget.name}. Spent ${formatBudgetCurrency(
        budget.spent || 0,
      )} of ${formatBudgetCurrency(budget.limit_amount)}. ${displayProgress}%`}>
      {/* Left side - Text content */}
      <View style={styles.leftContent}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {budget.name}
        </Text>

        {/* Amount Text */}
        <Text style={styles.amountText} numberOfLines={1}>
          {formatBudgetAmountOnly(budget.spent || 0)}{getCurrencySymbol()} / {formatBudgetAmountOnly(budget.limit_amount)}{getCurrencySymbol()}
        </Text>
      </View>

      {/* Right side - Circular progress */}
      <View style={styles.rightContent}>
        <View style={styles.horizontalDonutContainer}>
          <Svg width={horizontalDonutSize} height={horizontalDonutSize}>
            {/* Background circle */}
            <Circle
              cx={horizontalDonutSize / 2}
              cy={horizontalDonutSize / 2}
              r={horizontalRadius}
              stroke="#E5E5EA"
              strokeWidth={horizontalStrokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx={horizontalDonutSize / 2}
              cy={horizontalDonutSize / 2}
              r={horizontalRadius}
              stroke={progressColor}
              strokeWidth={horizontalStrokeWidth}
              strokeDasharray={horizontalStrokeDasharray}
              strokeDashoffset={horizontalStrokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${horizontalDonutSize / 2} ${horizontalDonutSize / 2
                })`}
            />
          </Svg>
        </View>
        {/* Percentage Text Below Circle */}
        <Text
          style={[styles.horizontalPercentageText, { color: progressColor }]}>
          {displayProgress}%
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F7F7F8',
    maxHeight: 73,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: 12,
  },
  leftContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rightContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    textAlign: 'left',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
    textAlign: 'left',
  },
  horizontalDonutContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalPercentageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalPercentageText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  // Keep old styles for backward compatibility if needed
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
});
