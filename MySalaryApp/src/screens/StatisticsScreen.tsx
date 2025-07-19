import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { useBudgets } from '../hooks/useBudgets';
import { BudgetResponse } from '../types/budget';
import { TotalBudgetDonut } from '../components/TotalBudgetDonut';
import { useUserCurrency } from '../hooks/useUserCurrency';
import { formatBudgetCurrency as formatBudgetCurrencyUtil } from '../utils/currencyUtils';
// Импорты стилей можно добавить при необходимости
// import { SkiaChart } from '../components/SkiaChart';

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    type?: 'income' | 'expense';
  }[];
}

interface NetWorthData {
  netWorth: number;
  primaryCurrency?: {
    symbol: string;
    name: string;
  };
  message: string;
}

interface CategorySpending {
  id: number;
  name: string;
  icon: string;
  color: string;
  totalAmount: number;
  percentage: number;
}

interface Transaction {
  id: number;
  amount: number;
  transaction_type: 'income' | 'expense';
  created_at?: string;
  createdAt?: string;
  transaction_date?: string;
  category: {
    id: number;
    category_name: string;
    category_type: string;
  };
  account: {
    currency: {
      symbol: string;
    };
  };
}

interface StatisticsScreenProps {
  route?: { params?: { segment?: 'analytics' | 'budgets' } };
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ route }) => {
  const insets = useSafeAreaInsets();
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Segment selection state
  const [selectedSegment, setSelectedSegment] = useState<'analytics' | 'budgets'>(
    route?.params?.segment || 'analytics'
  );

  // Budget data
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { formatCurrency } = useUserCurrency();
  
  // Budget sorting
  const [sortBy, setSortBy] = useState<'percent' | 'name' | 'spent'>('percent');

  // Net Worth состояние
  const [netWorth, setNetWorth] = useState<NetWorthData | null>(null);
  const [netWorthLoading, setNetWorthLoading] = useState(false);

  // Top Categories состояние
  const [topCategories, setTopCategories] = useState<CategorySpending[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const padding = 16;
  const gap = 12;

  // Размеры виджетов - увеличиваем высоту и делаем 2 блока по ширине
  const widgetHeight = 180; // Увеличили высоту
  const squareWidgetWidth = (screenWidth - padding * 2 - gap) / 2; // 2 блока по ширине

  // Fallback данные если API недоступен или нет токена
  const fallbackChartData: ChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [2500, 1800, 3200, 1600, 2900, 2100, 1400], // Доходы (положительные)
        type: 'income',
      },
      {
        data: [-1200, -800, -1500, -900, -1400, -1100, -700], // Расходы (отрицательные)
        type: 'expense',
      },
    ],
  };

  useEffect(() => {
    fetchChartData();
    loadNetWorth();
    loadTopCategories();
  }, []);

  // Update segment when route params change
  useEffect(() => {
    if (route?.params?.segment) {
      setSelectedSegment(route.params.segment);
    }
  }, [route?.params?.segment]);

  useFocusEffect(
    React.useCallback(() => {
      fetchChartData();
      loadNetWorth();
      loadTopCategories();
    }, []),
  );

  const fetchChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('token');
      console.log(
        'Retrieved token:',
        token ? 'Token exists' : 'No token found',
      );

      if (!token) {
        console.log('No auth token found, using fallback data');
        setChartData(fallbackChartData);
        setLoading(false);
        return;
      }

      console.log('Making request to: http://localhost:3001/api/transactions');
      const transactions = await apiService.get<Transaction[]>('/transactions');

      console.log('Raw transactions received:', transactions?.length || 0);
      console.log('First few transactions:', transactions?.slice(0, 3));

      if (!transactions || transactions.length === 0) {
        console.log('No transactions found, using fallback data');
        setChartData(fallbackChartData);
        setLoading(false);
        return;
      }

      // Получаем последние 7 дней
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      console.log('Date range for chart:', {
        from: last7Days[0].toDateString(),
        to: last7Days[6].toDateString(),
      });

      // Группируем транзакции по дням
      const dailyData = last7Days.map(date => {
        const dayTransactions = transactions.filter(t => {
          // Используем transaction_date или createdAt от Sequelize
          const transactionDate = new Date(
            t.transaction_date || t.createdAt || '',
          );
          const matches =
            transactionDate.toDateString() === date.toDateString();
          return matches;
        });

        console.log(
          `Date ${date.toDateString()}: found ${
            dayTransactions.length
          } transactions`,
        );

        const income = dayTransactions
          .filter(t => t.transaction_type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

        const expense = dayTransactions
          .filter(t => t.transaction_type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

        console.log(
          `Date ${date.toDateString()}: income=${income}, expense=${expense}`,
        );

        return {
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          income,
          expense: -expense, // Отрицательные для отображения внизу
        };
      });

      const chartData: ChartData = {
        labels: dailyData.map(d => d.label),
        datasets: [
          {
            data: dailyData.map(d => d.income),
            type: 'income',
          },
          {
            data: dailyData.map(d => d.expense),
            type: 'expense',
          },
        ],
      };

      console.log('Chart data processed:', chartData);
      console.log(
        'Income data:',
        dailyData.map(d => d.income),
      );
      console.log(
        'Expense data:',
        dailyData.map(d => d.expense),
      );
      setChartData(chartData);
    } catch (err) {
      console.error('Error fetching chart data:', err);
      console.log('Using fallback data due to error');
      setChartData(fallbackChartData);
    } finally {
      setLoading(false);
    }
  };

  const loadNetWorth = async () => {
    try {
      setNetWorthLoading(true);
      const netWorthData = await apiService.get<NetWorthData>('/networth');
      setNetWorth(netWorthData);
    } catch (error) {
      console.error('Ошибка загрузки Net Worth:', error);
      setNetWorth(null);
    } finally {
      setNetWorthLoading(false);
    }
  };

  const loadTopCategories = async () => {
    try {
      setCategoriesLoading(true);
      const transactions = await apiService.get<Transaction[]>('/transactions');

      if (!transactions || transactions.length === 0) {
        setTopCategories([]);
        return;
      }

      // Фильтруем только расходы
      const expenseTransactions = transactions.filter(
        t => t.transaction_type === 'expense',
      );

      // Группируем по категориям
      const categoryTotals: {
        [key: number]: { name: string; total: number; icon: string };
      } = {};

      expenseTransactions.forEach(transaction => {
        const categoryId = transaction.category.id;
        const amount = parseFloat(transaction.amount.toString()) || 0;

        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = {
            name: transaction.category.category_name,
            total: 0,
            icon: getCategoryIcon(transaction.category.category_name),
          };
        }

        categoryTotals[categoryId].total += amount;
      });

      // Конвертируем в массив и сортируем по сумме
      const sortedCategories = Object.entries(categoryTotals)
        .map(([id, data]) => ({
          id: parseInt(id),
          name: data.name,
          icon: data.icon,
          totalAmount: data.total,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5); // Берем топ-5

      // Вычисляем проценты
      const maxAmount = sortedCategories[0]?.totalAmount || 1;
      const topCategoriesWithPercentage: CategorySpending[] =
        sortedCategories.map((category, index) => ({
          ...category,
          percentage: (category.totalAmount / maxAmount) * 100,
          color: getCategoryColor(index),
        }));

      setTopCategories(topCategoriesWithPercentage);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      setTopCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string): string => {
    if (!categoryName) return '💰';

    const name = categoryName.toLowerCase();
    let icon = '💰';

    if (name.includes('зарплата')) icon = '💰';
    else if (name.includes('продукты') || name.includes('питание')) icon = '🛒';
    else if (name.includes('транспорт')) icon = '🚗';
    else if (name.includes('коммунальные')) icon = '🏠';
    else if (name.includes('развлечения')) icon = '🎬';
    else if (name.includes('одежда')) icon = '👕';
    else if (name.includes('медицина') || name.includes('здоровье'))
      icon = '⚕️';
    else if (name.includes('образование')) icon = '📚';
    else if (name.includes('дом') || name.includes('быт')) icon = '🏠';
    else if (name.includes('кредит') || name.includes('займ')) icon = '💳';
    else if (name.includes('спорт') || name.includes('фитнес')) icon = '🏋️';
    else if (name.includes('путешествия')) icon = '✈️';
    else if (name.includes('ресторан') || name.includes('кафе')) icon = '🍽️';
    else if (name.includes('бензин') || name.includes('парковка')) icon = '⛽';
    else if (name.includes('красота') || name.includes('уход')) icon = '💄';
    else if (name.includes('подарки')) icon = '🎁';
    else if (name.includes('прочие')) icon = '💸';

    return icon;
  };

  const getCategoryColor = (index: number): string => {
    const colors = ['#28a745', '#007bff', '#dc3545', '#17a2b8', '#ffc107'];
    return colors[index % colors.length];
  };

  const formatNetWorth = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNetWorthShort = (amount: number): string => {
    const absValue = Math.abs(amount);
    const rounded = Math.round(amount);
    const symbol = netWorth?.primaryCurrency?.symbol || '$';

    // Подсчитываем количество знаков в числе (включая знак минуса если есть)
    const digitCount = Math.abs(rounded).toString().length;

    // Если число помещается в 6 знаков, показываем полностью с разделителями
    if (digitCount <= 6) {
      return `${rounded.toLocaleString('en-US')} ${symbol}`;
    }

    // Если больше 6 знаков, используем сокращения
    if (absValue >= 1000000000) {
      const formatted = (amount / 1000000000).toFixed(1);
      return `${formatted}B ${symbol}`.replace('.0B', 'B');
    } else if (absValue >= 1000000) {
      const formatted = (amount / 1000000).toFixed(1);
      return `${formatted}M ${symbol}`.replace('.0M', 'M');
    } else if (absValue >= 1000) {
      const formatted = (amount / 1000).toFixed(1);
      return `${formatted}K ${symbol}`.replace('.0K', 'K');
    } else {
      return `${rounded.toLocaleString('en-US')} ${symbol}`;
    }
  };

  // Виджет с графиком - БЕЛЫЙ фон
  const ChartWidget = () => (
    <View
      style={{
        width: screenWidth - 32,
        height: widgetHeight,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        padding: 16,
      }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#000000',
          marginBottom: 16,
          textAlign: 'left',
        }}>
        Expenses by Date
      </Text>

      <View style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFAF7B" />
        ) : chartData ? (
          <View
            style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Text style={{ color: '#666666', fontSize: 14 }}>
              Chart component temporarily disabled
            </Text>
          </View>
        ) : (
          <Text style={{ color: '#666666', fontSize: 12 }}>
            Failed to load chart data
          </Text>
        )}
      </View>
    </View>
  );

  // Виджет Net Worth - левый квадрат
  const NetWorthWidget = () => (
    <View
      style={{
        width: squareWidgetWidth,
        height: widgetHeight,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        padding: 16,
      }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#000000',
          marginBottom: 16,
          textAlign: 'left',
        }}>
        Net Worth
      </Text>

      {netWorthLoading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#FFAF7B" />
        </View>
      ) : netWorth ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#000000',
            }}>
            {formatNetWorthShort(netWorth.netWorth)}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          onPress={loadNetWorth}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 8,
          }}>
          <Text
            style={{
              fontSize: 12,
              color: '#666666',
              marginBottom: 4,
              textAlign: 'center',
            }}>
            Failed to load data
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: '#FFAF7B',
              textAlign: 'center',
            }}>
            Tap to retry
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Виджет топ-3 категорий - правый квадрат
  const TopCategoriesWidget = () => (
    <View
      style={{
        width: squareWidgetWidth,
        height: widgetHeight,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        padding: 16,
      }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#000000',
          marginBottom: 16,
          textAlign: 'left',
        }}>
        Top-3 Categories
      </Text>

      {categoriesLoading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#FFAF7B" />
        </View>
      ) : topCategories.length > 0 ? (
        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
          {/* Показываем ровно 3 категории, дополняем пустыми если нужно */}
          {Array.from({ length: 3 }, (_, index) => {
            const category = topCategories[index];
            if (!category) {
              // Пустая полоска для недостающих категорий
              return (
                <View
                  key={`empty-${index}`}
                  style={{ marginBottom: index < 2 ? 8 : 0 }}>
                  <View
                    style={{
                      height: 24,
                      backgroundColor: '#F0F0F0',
                      borderRadius: 6,
                      justifyContent: 'center',
                      paddingHorizontal: 8,
                      opacity: 0.3,
                    }}>
                    <Text
                      style={{
                        fontSize: 10,
                        color: '#999999',
                        textAlign: 'left',
                      }}>
                      📊 No data
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <View
                key={category.id}
                style={{ marginBottom: index < 2 ? 12 : 0 }}>
                {/* Цветная полоска с иконкой и названием */}
                <View
                  style={{
                    height: 28,
                    backgroundColor: category.color,
                    borderRadius: 6,
                    width: `${category.percentage}%`,
                    position: 'relative',
                    overflow: 'visible',
                    flexWrap: 'nowrap',
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#000000',
                      fontWeight: '600',
                      textAlign: 'left',
                      position: 'absolute',
                      left: 8,
                      top: 0,
                      bottom: 0,
                      lineHeight: 28,
                      flexShrink: 0,
                      minWidth: 200,
                      maxWidth: 200,
                    }}
                    allowFontScaling={false}>
                    {category.icon} {category.name}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <TouchableOpacity
          onPress={loadTopCategories}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 8,
          }}>
          <Text
            style={{
              fontSize: 12,
              color: '#666666',
              marginBottom: 4,
              textAlign: 'center',
            }}>
            No expense data
          </Text>
          <Text
            style={{
              fontSize: 10,
              color: '#FFAF7B',
              textAlign: 'center',
            }}>
            Tap to retry
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Виджет недавних транзакций - широкий внизу
  const RecentTransactionsWidget = () => (
    <View
      style={{
        width: screenWidth - 32,
        height: widgetHeight,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        padding: 16,
      }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#000000',
          marginBottom: 16,
          textAlign: 'left',
        }}>
        Recent Transactions
      </Text>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 14,
            color: '#666666',
            textAlign: 'center',
          }}>
          Coming Soon
        </Text>
      </View>
    </View>
  );

  // Segmented Control
  const SegmentedControl = () => (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}>
      <TouchableOpacity
        style={{
          flex: 1,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: selectedSegment === 'analytics' ? '#9DEAFB' : 'transparent',
        }}
        onPress={() => setSelectedSegment('analytics')}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600',
            color: selectedSegment === 'analytics' ? '#000' : '#666',
          }}>
          Analytics
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          flex: 1,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: selectedSegment === 'budgets' ? '#9DEAFB' : 'transparent',
        }}
        onPress={() => setSelectedSegment('budgets')}>
        <Text
          style={{
            textAlign: 'center',
            fontSize: 16,
            fontWeight: '600',
            color: selectedSegment === 'budgets' ? '#000' : '#666',
          }}>
          Budgets
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Budget Overview Widget
  const BudgetOverviewWidget = () => (
    <View
      style={{
        width: screenWidth - 32,
        height: widgetHeight,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        padding: 16,
      }}>
      <Text
        style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#000000',
          marginBottom: 16,
          textAlign: 'left',
        }}>
        Budget Overview
      </Text>

      {budgetsLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" color="#9DEAFB" />
        </View>
      ) : budgets && budgets.length > 0 ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {budgets.slice(0, 3).map((budget: BudgetResponse) => {
            const progress = (budget.spent_amount / budget.limit_amount) * 100;
            const progressColor = progress > 100 ? '#EF4444' : progress > 80 ? '#F59E0B' : '#10B981';
            
            return (
              <View key={budget.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#000' }}>
                    {budget.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#666' }}>
                    {Math.round(progress)}%
                  </Text>
                </View>
                <View style={{ 
                  height: 6, 
                  backgroundColor: '#F3F4F6', 
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  <View style={{
                    height: '100%',
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: progressColor,
                    borderRadius: 3,
                  }} />
                </View>
                <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                  {formatBudgetCurrencyUtil(budget.spent_amount, budget.currency, formatCurrency)} / {formatBudgetCurrencyUtil(budget.limit_amount, budget.currency, formatCurrency)}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
            No budgets created yet
          </Text>
        </View>
      )}
    </View>
  );

  // Budget Performance Widget - левый квадрат
  const BudgetPerformanceWidget = () => {
    const totalBudgets = budgets?.length || 0;
    const overBudgetCount = budgets?.filter(b => (b.spent_amount / b.limit_amount) > 1).length || 0;
    
    return (
      <View
        style={{
          width: squareWidgetWidth,
          height: widgetHeight,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
          padding: 16,
        }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#000000',
            marginBottom: 16,
            textAlign: 'left',
          }}>
          Performance
        </Text>

        {budgetsLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#9DEAFB" />
          </View>
        ) : totalBudgets > 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: overBudgetCount > 0 ? '#EF4444' : '#10B981' }}>
              {totalBudgets - overBudgetCount}/{totalBudgets}
            </Text>
            <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 }}>
              On Track
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
              No data
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Budget Spending Widget - правый квадрат  
  const BudgetSpendingWidget = () => {
    const totalSpent = budgets?.reduce((sum, budget) => sum + budget.spent_amount, 0) || 0;
    const totalLimit = budgets?.reduce((sum, budget) => sum + budget.limit_amount, 0) || 0;
    const averageProgress = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
    
    return (
      <View
        style={{
          width: squareWidgetWidth,
          height: widgetHeight,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
          padding: 16,
        }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#000000',
            marginBottom: 16,
            textAlign: 'left',
          }}>
          Total Spent
        </Text>

        {budgetsLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#9DEAFB" />
          </View>
        ) : totalLimit > 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#000' }}>
              {Math.round(averageProgress)}%
            </Text>
            <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 }}>
              of total budget
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
              No data
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Sort budgets based on selected criteria
  const getSortedBudgets = () => {
    if (!budgets) return [];
    
    const budgetsWithCalcFields = budgets.map(budget => ({
      ...budget,
      percent: (budget.spent || 0) / budget.limit_amount * 100,
      spent_amount: budget.spent || 0,
    }));

    switch (sortBy) {
      case 'percent':
        return budgetsWithCalcFields.sort((a, b) => b.percent - a.percent);
      case 'name':
        return budgetsWithCalcFields.sort((a, b) => a.name.localeCompare(b.name));
      case 'spent':
        return budgetsWithCalcFields.sort((a, b) => b.spent_amount - a.spent_amount);
      default:
        return budgetsWithCalcFields;
    }
  };

  // Budget Progress Bars Component
  const BudgetProgressBars = () => {
    const sortedBudgets = getSortedBudgets();
    
    return (
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: '#000',
          marginBottom: 16,
        }}>
          Budget Progress
        </Text>
        
        {budgetsLoading ? (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <ActivityIndicator size="small" color="#9DEAFB" />
          </View>
        ) : sortedBudgets.length > 0 ? (
          sortedBudgets.map((budget, index) => {
            const progress = budget.percent;
            const progressColor = progress > 100 ? '#E74C3C' : progress >= 80 ? '#F1C40F' : '#2ECC71';
            
            return (
              <View key={budget.id} style={{ marginBottom: index < sortedBudgets.length - 1 ? 16 : 0 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: '#000', flex: 1 }}>
                    {budget.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666', marginLeft: 8 }}>
                    {Math.round(progress)}%
                  </Text>
                </View>
                <View style={{ 
                  height: 6, 
                  backgroundColor: '#E5E5EA', 
                  borderRadius: 3,
                  overflow: 'hidden',
                  marginBottom: 4,
                }}>
                  <View style={{
                    height: '100%',
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor: progressColor,
                    borderRadius: 3,
                  }} />
                </View>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {formatBudgetCurrencyUtil(budget.spent_amount, budget.currency, formatCurrency)} / {formatBudgetCurrencyUtil(budget.limit_amount, budget.currency, formatCurrency)}
                </Text>
              </View>
            );
          })
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
              No budgets created yet
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Budget KPI Cards
  const BudgetKPICards = () => {
    const totalSpent = budgets?.reduce((sum, budget) => sum + (budget.spent || 0), 0) || 0;
    const totalBudgets = budgets?.length || 0;
    const budgetsOnTrack = budgets?.filter(b => ((b.spent || 0) / b.limit_amount) <= 1).length || 0;
    
    return (
      <View style={{
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
      }}>
        <View style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 12,
          alignItems: 'center',
          height: 72,
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Total Spent
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#000' }}>
            {formatCurrency(totalSpent)}
          </Text>
        </View>
        
        <View style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 12,
          alignItems: 'center',
          height: 72,
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}>
          <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
            Budgets on Track
          </Text>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#000' }}>
            {budgetsOnTrack}/{totalBudgets}
          </Text>
        </View>
      </View>
    );
  };

  // Budget Sorting Control
  const BudgetSortingControl = () => {
    const sortOptions = [
      { key: 'percent', label: '%' },
      { key: 'name', label: 'Name' },
      { key: 'spent', label: 'Spent' },
    ];
    
    return (
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        flexDirection: 'row',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: sortBy === option.key ? '#9DEAFB' : 'transparent',
              alignItems: 'center',
            }}
            onPress={() => setSortBy(option.key as 'percent' | 'name' | 'spent')}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: '500',
              color: sortBy === option.key ? '#000' : '#666',
            }}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <ScrollView
        style={{ flex: 1, backgroundColor: '#F6F7F8' }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        {/* Градиентная шапка */}
        <LinearGradient
          colors={['#FFAF7B', '#D76D77']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: insets.top + 14,
            paddingBottom: 16,
            paddingHorizontal: padding,
          }}>
          <View style={{ height: 28 }} />
        </LinearGradient>

        {/* Контент на сером фоне */}
        <View
          style={{
            backgroundColor: '#F6F7F8',
            paddingHorizontal: padding,
            paddingTop: 20,
            paddingBottom: 20,
            flex: 1,
          }}>
          {/* Segmented Control */}
          <SegmentedControl />

          {selectedSegment === 'analytics' ? (
            <>
              {/* График виджет */}
              <View style={{ marginBottom: gap }}>
                <ChartWidget />
              </View>

              {/* Два квадратных виджета в ряд */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: gap,
                }}>
                <NetWorthWidget />
                <TopCategoriesWidget />
              </View>

              {/* Широкий виджет */}
              <RecentTransactionsWidget />
            </>
          ) : (
            <>
              {/* Total Budget Donut */}
              <TotalBudgetDonut budgets={budgets || []} />

              {/* Budget Progress Bars */}
              <BudgetProgressBars />

              {/* Budget KPI Cards */}
              <BudgetKPICards />

              {/* Budget Sorting Control */}
              <BudgetSortingControl />
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
};
