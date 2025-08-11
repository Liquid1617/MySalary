import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import { formatCurrencyAmountShort, formatCurrencyCompact } from '../../utils/formatCurrency';
import { styles } from './styles';

interface NetWorthHeaderProps {
  user: any;
  netWorthData: {
    loading: boolean;
    data?: { netWorth: number };
    error?: any;
  };
  userCurrency?: any;
  monthlyNetChange: number;
  isNetChangePositive: boolean;
  onRetry: () => void;
  insets: { top: number };
}

const getCurrentDate = () => {
  const today = new Date();
  let month = today.toLocaleDateString('en-US', { month: 'long' });
  if (month.length > 4) {
    month = month.substring(0, 3);
  }
  const day = today.getDate();
  return { month, day };
};

export const NetWorthHeader: React.FC<NetWorthHeaderProps> = ({
  user,
  netWorthData,
  userCurrency,
  monthlyNetChange,
  isNetChangePositive,
  onRetry,
  insets,
}) => {
  return (
    <LinearGradient
      colors={['#D1CCFF', '#8CE6F3', '#7AF0C4', '#C7FB33']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      useAngle={true}
      angle={30}
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}>
      {/* Header with greeting and date */}
      <View style={styles.header}>
        {/* Left side - Greeting */}
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.userName}>{user?.name || 'User'}!</Text>
        </View>

        {/* Right side - Date */}
        <View style={styles.dateContainer}>
          <View style={styles.dateBox}>
            <Text style={styles.monthText}>
              {getCurrentDate().month}
            </Text>
            <Text style={styles.dayText}>
              {getCurrentDate().day}
            </Text>
          </View>
        </View>
      </View>

      {/* Net Worth section */}
      <View style={styles.netWorthContainer}>
        <View style={styles.netWorthHeader}>
          <Text style={styles.netWorthLabel}>Total Net Worth</Text>
        </View>

        {netWorthData.loading ? (
          <View>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : netWorthData.data ? (
          <View>
            <Text style={styles.netWorthAmount}>
              {formatCurrencyAmountShort(
                netWorthData.data.netWorth,
                userCurrency,
              )}
            </Text>
            <View style={styles.changeContainer}>
              <FontAwesome6
                name={
                  isNetChangePositive
                    ? 'arrow-trend-up'
                    : 'arrow-trend-down'
                }
                size={14}
                color={isNetChangePositive ? '#22C55E' : '#EF4444'}
                solid
                style={styles.changeIcon}
              />
              <Text
                style={[
                  styles.changeText,
                  {
                    color: isNetChangePositive ? '#22C55E' : '#EF4444',
                  },
                ]}>
                {isNetChangePositive ? '+' : ''}
                {formatCurrencyCompact(
                  Math.abs(monthlyNetChange),
                  userCurrency,
                )}{' '}
                this month
              </Text>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.errorText}>Failed to load</Text>
            <TouchableOpacity
              onPress={onRetry}
              style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};