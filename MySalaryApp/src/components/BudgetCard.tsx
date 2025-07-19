import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { BudgetResponse } from '../types/budget';
import { useUserCurrency } from '../hooks/useUserCurrency';
import { formatBudgetCurrency as formatBudgetCurrencyUtil } from '../utils/currencyUtils';

interface BudgetCardProps {
  budget: BudgetResponse;
  onPress: (budget: BudgetResponse) => void;
  onAnalytics: (event: string, properties: any) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onPress, onAnalytics }) => {
  const { formatCurrency } = useUserCurrency();
  const progress = Math.min(budget.percent || 0, 100);
  const isOverBudget = (budget.percent || 0) > 100;
  const leftAmount = budget.limit_amount - (budget.spent || 0);

  const formatBudgetCurrency = (amount: number) => {
    if (!budget?.currency) return formatCurrency(amount);
    return formatBudgetCurrencyUtil(amount, budget.currency, formatCurrency);
  };
  
  // Progress ring colors based on percentage
  const getProgressColor = (percent: number) => {
    if (percent > 100) return '#FF4C4C'; // Red for over budget
    if (percent >= 80) return '#FFBD2F'; // Yellow for 80-100%
    return '#3FD777'; // Green for 0-80%
  };

  const progressColor = getProgressColor(progress);
  const cardWidth = screenWidth * 0.86;
  const cardHeight = 120;
  
  // SVG circle calculations
  const size = 56;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handlePress = () => {
    onAnalytics('budget_card_click', { id: budget.id });
    onPress(budget);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth, height: cardHeight }]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`Budget ${budget.name}, ${progress}% used`}
    >
      <View style={styles.content}>
        {/* Progress Ring */}
        <View style={styles.progressContainer}>
          <Svg width={size} height={size} style={styles.progressRing}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E5E5EA"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={progressColor}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          
          {/* Progress percentage in center */}
          <View style={styles.progressText}>
            <Text style={[styles.percentageText, { color: progressColor }]}>
              {Math.round(progress)}%
            </Text>
          </View>
        </View>

        {/* Budget Info */}
        <View style={styles.info}>
          <Text style={styles.budgetName} numberOfLines={1}>
            {budget.name}
          </Text>
          <Text style={[styles.leftAmount, { color: isOverBudget ? '#FF4C4C' : '#666' }]}>
            {isOverBudget ? 'Over by: ' : 'Left: '}
            {formatBudgetCurrency(Math.abs(leftAmount))}
          </Text>
        </View>

        {/* Analytics Navigation Icon */}
        <TouchableOpacity 
          style={styles.iconContainer}
          onPress={() => onAnalytics('budget_analytics_click', { id: budget.id })}
          activeOpacity={0.7}
        >
          <FontAwesome5 
            name="chart-pie" 
            size={20} 
            color="#666" 
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressContainer: {
    position: 'relative',
    marginRight: 16,
  },
  progressRing: {
    transform: [{ rotate: '-90deg' }],
  },
  progressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  budgetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  leftAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  icon: {
    opacity: 0.8,
  },
});