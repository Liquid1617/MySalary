import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { BudgetResponse } from '../types/budget';
import { useUserCurrency } from '../hooks/useUserCurrency';

interface TotalBudgetDonutProps {
  budgets: BudgetResponse[];
}

export const TotalBudgetDonut: React.FC<TotalBudgetDonutProps> = ({ budgets }) => {
  const { formatCurrency } = useUserCurrency();
  // Calculate total spent and total budget across all budgets
  const totals = budgets.reduce(
    (acc, budget) => {
      acc.totalSpent += budget.spent || 0;
      acc.totalBudget += budget.limit_amount;
      return acc;
    },
    { totalSpent: 0, totalBudget: 0 }
  );

  const percentage = totals.totalBudget > 0 ? (totals.totalSpent / totals.totalBudget) * 100 : 0;
  const displayPercentage = Math.min(percentage, 100); // Cap at 100% for display
  
  // Progress colors based on percentage
  const getProgressColor = (percent: number) => {
    if (percent > 100) return '#E74C3C'; // Red for over budget
    if (percent >= 80) return '#F1C40F'; // Yellow for 80-100%
    return '#2ECC71'; // Green for 0-80%
  };

  const progressColor = getProgressColor(percentage);

  // Large donut calculations (200pt diameter)
  const donutSize = 200;
  const strokeWidth = 20;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;


  return (
    <View style={styles.container}>
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
        
        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={[styles.percentageText, { color: progressColor }]}>
            {Math.round(displayPercentage)}%
          </Text>
          <Text style={styles.subtitleText}>of total budget</Text>
        </View>
      </View>

      {/* Summary info below donut */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>
          {formatCurrency(totals.totalSpent)} spent of {formatCurrency(totals.totalBudget)}
        </Text>
        {percentage > 100 && (
          <Text style={styles.overBudgetText}>
            Over budget by {formatCurrency(totals.totalSpent - totals.totalBudget)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  donutContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  summaryContainer: {
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  overBudgetText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
});