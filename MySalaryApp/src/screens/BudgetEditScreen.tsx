import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useBudgetActions } from '../hooks/useBudgets';
import { apiService } from '../services/api';
import {
  BudgetResponse,
  PeriodType,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from '../types/budget';
import { useUserCurrency } from '../hooks/useUserCurrency';

interface BudgetEditScreenProps {
  route: {
    params: {
      budget?: BudgetResponse;
    };
  };
  navigation: any;
}

interface Category {
  id: number;
  name: string;
  type: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
}

const PERIOD_OPTIONS: { value: PeriodType; label: string }[] = [
  { value: 'month', label: 'Monthly' },
  { value: 'week', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

export const BudgetEditScreen: React.FC<BudgetEditScreenProps> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { budget } = route.params || {};
  const { createBudget, updateBudget, deleteBudget, isLoading } =
    useBudgetActions();
  const { userCurrency } = useUserCurrency();

  const [formData, setFormData] = useState({
    name: '',
    limit_amount: '',
    currency: userCurrency?.code || 'USD',
    period_type: 'month' as PeriodType,
    rollover: false,
    categories: [] as string[],
    custom_start_date: '',
    custom_end_date: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const isEditing = !!budget;

  useEffect(() => {
    loadFormData();
    if (budget) {
      setFormData({
        name: budget.name,
        limit_amount: budget.limit_amount.toString(),
        currency: budget.currency,
        period_type: budget.period_type,
        rollover: budget.rollover,
        categories: budget.categories.map(c => c.category_id),
        custom_start_date: budget.custom_start_date || '',
        custom_end_date: budget.custom_end_date || '',
      });
    } else {
      resetForm();
    }
  }, [budget, userCurrency, resetForm]);

  // Initialize dates when period type changes (same logic as BudgetFormModal)
  const [previousPeriodType, setPreviousPeriodType] =
    useState<PeriodType>('month');

  useEffect(() => {
    if (
      formData.period_type !== previousPeriodType &&
      formData.period_type !== 'custom'
    ) {
      const startDate = getCalculatedStartDate(formData.period_type);
      const endDate = getCalculatedEndDate(formData.period_type);
      setFormData(prev => ({
        ...prev,
        custom_start_date: startDate,
        custom_end_date: endDate,
      }));
    }
    setPreviousPeriodType(formData.period_type);
  }, [
    formData.period_type,
    previousPeriodType,
    getCalculatedStartDate,
    getCalculatedEndDate,
  ]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      console.log('Loading categories and currencies...');

      const [categoriesData, currenciesResponse] = await Promise.all([
        apiService.get<Category[]>('/categories'),
        apiService.get<{ currencies: Currency[] }>('/currencies'),
      ]);

      console.log('Categories loaded:', categoriesData);
      console.log('Categories count:', categoriesData?.length || 0);
      console.log('Currencies response loaded:', currenciesResponse);
      console.log(
        'Currencies count:',
        currenciesResponse?.currencies?.length || 0,
      );

      const finalCategories = categoriesData || [];
      const finalCurrencies = currenciesResponse?.currencies || [];

      setCategories(finalCategories);
      setCurrencies(finalCurrencies);

      console.log('Final categories set:', finalCategories.length);
      console.log('Final currencies set:', finalCurrencies.length);

      if (finalCategories.length > 0) {
        console.log('First category:', finalCategories[0]);
        console.log(
          'Expense categories:',
          finalCategories.filter(cat => cat.type === 'expense'),
        );
      }
    } catch (error) {
      console.error('Error loading form data:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Error',
        `Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = useCallback(() => {
    const startDate = getCalculatedStartDate('month');
    const endDate = getCalculatedEndDate('month');
    setFormData({
      name: '',
      limit_amount: '',
      currency: userCurrency?.code || 'USD',
      period_type: 'month',
      rollover: false,
      categories: [],
      custom_start_date: startDate,
      custom_end_date: endDate,
    });
  }, [getCalculatedStartDate, getCalculatedEndDate, userCurrency]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a budget name');
      return;
    }

    if (!formData.limit_amount || parseFloat(formData.limit_amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget amount');
      return;
    }

    if (formData.categories.length === 0) {
      Alert.alert('Error', 'Please select at least one category');
      return;
    }

    try {
      // Always use dates from form fields (identical logic to BudgetFormModal)
      const startDate = formData.custom_start_date;
      const endDate = formData.custom_end_date;

      console.log(`=== SAVING BUDGET (Frontend) ===`);
      console.log(`Period type: ${formData.period_type}`);
      console.log(`Using form dates: ${startDate} to ${endDate}`);

      const budgetData = {
        name: formData.name.trim(),
        limit_amount: parseFloat(formData.limit_amount),
        currency: formData.currency,
        period_type: formData.period_type,
        rollover: formData.rollover,
        categories: formData.categories,
        custom_start_date: startDate,
        custom_end_date: endDate,
      };

      console.log(
        'Full budget data being sent:',
        JSON.stringify(budgetData, null, 2),
      );

      if (isEditing) {
        await updateBudget.mutateAsync({
          id: budget!.id,
          ...budgetData,
        });
      } else {
        await createBudget.mutateAsync(budgetData);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving budget:', error);
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const handleDelete = async () => {
    if (!budget) return;

    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(
                'Attempting to delete budget with ID:',
                budget.id,
                typeof budget.id,
              );
              await deleteBudget.mutateAsync(budget.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting budget:', error);
              console.error('Error details:', JSON.stringify(error, null, 2));
              const errorMessage =
                error instanceof Error ? error.message : 'Unknown error';
              Alert.alert('Error', `Failed to delete budget: ${errorMessage}`);
            }
          },
        },
      ],
    );
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  // Helper functions to calculate dates for different period types (independent of formData)
  const getCalculatedStartDate = useCallback((periodType: PeriodType) => {
    // For month/week, calculate from today using UTC to avoid timezone issues
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Local date without time

    if (periodType === 'month') {
      // Start of current month (using UTC to avoid timezone issues)
      const year = today.getFullYear();
      const month = today.getMonth();
      const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      return startOfMonth.toISOString().split('T')[0];
    } else if (periodType === 'week') {
      // Start of current week (Monday)
      const day = today.getDay();

      // Calculate days to subtract to get to Monday
      // Sunday = 0, Monday = 1, Tuesday = 2, ..., Saturday = 6
      // Days to go back: Sunday=6, Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5
      const daysToMonday = day === 0 ? 6 : day - 1;

      // Use UTC date calculation to avoid timezone issues
      const startOfWeek = new Date(
        Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - daysToMonday,
          0,
          0,
          0,
          0,
        ),
      );

      return startOfWeek.toISOString().split('T')[0];
    }

    return today.toISOString().split('T')[0];
  }, []);

  // Helper functions to get display dates (for UI display)
  const getDisplayStartDate = () => {
    if (formData.period_type === 'custom') {
      return formData.custom_start_date || '';
    }
    return (
      formData.custom_start_date || getCalculatedStartDate(formData.period_type)
    );
  };

  const getCalculatedEndDate = useCallback(
    (periodType: PeriodType) => {
      if (periodType === 'month') {
        // Last day of current month (using UTC to avoid timezone issues)
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const endOfMonth = new Date(
          Date.UTC(year, month + 1, 0, 23, 59, 59, 999),
        ); // Last day of current month
        return endOfMonth.toISOString().split('T')[0];
      } else if (periodType === 'week') {
        // End of current week (Sunday) - 6 days after Monday
        const startDateStr = getCalculatedStartDate(periodType);
        const startDate = new Date(startDateStr + 'T00:00:00.000Z');

        // Calculate end date using UTC
        const endOfWeek = new Date(
          Date.UTC(
            startDate.getUTCFullYear(),
            startDate.getUTCMonth(),
            startDate.getUTCDate() + 6,
            23,
            59,
            59,
            999,
          ),
        );

        return endOfWeek.toISOString().split('T')[0];
      }

      // Default 30 days for custom
      const today = new Date();
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 30);
      return endDate.toISOString().split('T')[0];
    },
    [getCalculatedStartDate],
  );

  const getDisplayEndDate = () => {
    if (formData.period_type === 'custom') {
      return formData.custom_end_date || '';
    }
    return (
      formData.custom_end_date || getCalculatedEndDate(formData.period_type)
    );
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}>
            <FontAwesome5 name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Budget' : 'Create Budget'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {loadingData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9DEAFB" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Budget Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Name</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={text =>
                setFormData(prev => ({ ...prev, name: text }))
              }
              placeholder="e.g., Food, Entertainment"
              placeholderTextColor="#999"
            />
          </View>

          {/* Budget Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Amount</Text>
            <View style={styles.amountContainer}>
              <TextInput
                style={[styles.textInput, styles.amountInput]}
                value={formData.limit_amount}
                onChangeText={text =>
                  setFormData(prev => ({ ...prev, limit_amount: text }))
                }
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.currencySelector}
                onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}>
                <Text style={styles.currencyText}>{formData.currency}</Text>
                <FontAwesome5 name="chevron-down" size={12} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Period Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Period</Text>
            <View style={styles.periodContainer}>
              {PERIOD_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.periodButton,
                    formData.period_type === option.value &&
                    styles.periodButtonActive,
                  ]}
                  onPress={() =>
                    setFormData(prev => ({
                      ...prev,
                      period_type: option.value,
                    }))
                  }>
                  <Text
                    style={[
                      styles.periodButtonText,
                      formData.period_type === option.value &&
                      styles.periodButtonTextActive,
                    ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Period Dates - always show */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {formData.period_type === 'custom'
                ? 'Custom Period'
                : 'Budget Period'}
            </Text>
            <Text style={styles.sectionDescription}>
              {formData.period_type === 'month' &&
                'From start of current month to end of current month'}
              {formData.period_type === 'week' &&
                'From start of current week (Monday) to end of current week (Sunday)'}
              {formData.period_type === 'custom' &&
                'Set your custom start and end dates'}
            </Text>
            <View style={styles.dateFieldsContainer}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    formData.period_type !== 'custom' &&
                    styles.dateInputDisabled,
                  ]}
                  placeholder="YYYY-MM-DD"
                  value={getDisplayStartDate()}
                  onChangeText={
                    formData.period_type === 'custom'
                      ? text =>
                        setFormData(prev => ({
                          ...prev,
                          custom_start_date: text,
                        }))
                      : undefined
                  }
                  editable={formData.period_type === 'custom'}
                />
              </View>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TextInput
                  style={[
                    styles.dateInput,
                    formData.period_type !== 'custom' &&
                    styles.dateInputDisabled,
                  ]}
                  placeholder="YYYY-MM-DD"
                  value={getDisplayEndDate()}
                  onChangeText={
                    formData.period_type === 'custom'
                      ? text =>
                        setFormData(prev => ({
                          ...prev,
                          custom_end_date: text,
                        }))
                      : undefined
                  }
                  editable={formData.period_type === 'custom'}
                />
              </View>
            </View>
          </View>

          {/* Rollover */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.rolloverContainer}
              onPress={() =>
                setFormData(prev => ({ ...prev, rollover: !prev.rollover }))
              }>
              <View style={styles.rolloverInfo}>
                <Text style={styles.rolloverTitle}>Rollover unused amount</Text>
                <Text style={styles.rolloverDescription}>
                  Carry over unused budget to next period
                </Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  formData.rollover && styles.toggleActive,
                ]}>
                <View
                  style={[
                    styles.toggleThumb,
                    formData.rollover && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.sectionDescription}>
              Select categories to track in this budget
            </Text>
            {expenseCategories.length === 0 ? (
              <Text style={styles.emptyCategoriesText}>
                Loading categories...
              </Text>
            ) : (
              <View style={styles.categoriesContainer}>
                {expenseCategories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      formData.categories.includes(category.id.toString()) &&
                      styles.categoryButtonActive,
                    ]}
                    onPress={() => toggleCategory(category.id.toString())}>
                    <Text
                      style={[
                        styles.categoryButtonText,
                        formData.categories.includes(category.id.toString()) &&
                        styles.categoryButtonTextActive,
                      ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Delete Button (only for editing) */}
          {isEditing && (
            <View style={styles.deleteSection}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={isLoading}>
                <FontAwesome5 name="trash" size={16} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>Delete Budget</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      {/* Currency Picker Overlay */}
      {showCurrencyPicker && (
        <View style={styles.currencyPickerOverlay}>
          <TouchableWithoutFeedback
            onPress={() => setShowCurrencyPicker(false)}>
            <View style={styles.currencyPickerBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.currencyPickerModal}>
            <ScrollView
              style={styles.currencyScrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {currencies.map(currency => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyOption,
                    formData.currency === currency.code &&
                    styles.currencyOptionActive,
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, currency: currency.code }));
                    setShowCurrencyPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.currencyOptionText,
                      formData.currency === currency.code &&
                      styles.currencyOptionTextActive,
                    ]}>
                    {currency.code} - {currency.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    backgroundColor: '#9DEAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  section: {
    marginBottom: 24,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    marginRight: 12,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  currencyPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyPickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  currencyPickerModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    maxHeight: 400,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  currencyScrollView: {
    maxHeight: 350,
  },
  currencyOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currencyOptionActive: {
    backgroundColor: '#e3f2fd',
  },
  currencyOptionText: {
    fontSize: 14,
    color: '#333',
  },
  currencyOptionTextActive: {
    color: '#2196f3',
    fontWeight: '600',
  },
  periodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#9DEAFB',
    borderColor: '#9DEAFB',
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#000',
  },
  rolloverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  rolloverInfo: {
    flex: 1,
  },
  rolloverTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  rolloverDescription: {
    fontSize: 14,
    color: '#666',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#9DEAFB',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  categoryButtonActive: {
    backgroundColor: '#9DEAFB',
    borderColor: '#9DEAFB',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#000',
  },
  emptyCategoriesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  deleteSection: {
    marginTop: 32,
    marginBottom: 24,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  bottomSpacer: {
    height: 40,
  },

  // Custom Date Fields
  dateFieldsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  dateInputDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
    color: '#6B7280',
  },
});
