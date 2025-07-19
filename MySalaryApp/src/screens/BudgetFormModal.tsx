import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useBudgetActions } from '../hooks/useBudgets';
import { apiService } from '../services/api';
import { BudgetResponse, PeriodType } from '../types/budget';

interface BudgetFormModalProps {
  visible: boolean;
  budget?: BudgetResponse;
  onClose: () => void;
  onSuccess: () => void;
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

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  visible,
  budget,
  onClose,
  onSuccess,
}) => {
  const insets = useSafeAreaInsets();
  const { createBudget, updateBudget, deleteBudget, isLoading } =
    useBudgetActions();

  const [formData, setFormData] = useState({
    name: '',
    limit_amount: '',
    currency: 'USD',
    period_type: 'month' as PeriodType,
    rollover: false,
    categories: [] as string[],
    custom_start_date: '',
    custom_end_date: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [userPrimaryCurrency, setUserPrimaryCurrency] = useState<string>('USD');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const isEditing = !!budget;

  // Helper functions to calculate dates for different period types
  const getCalculatedStartDate = useCallback((periodType: PeriodType) => {
    console.log(`=== getCalculatedStartDate ===`);
    console.log(`Period type: ${periodType}`);
    
    // For month/week, calculate from today using UTC to avoid timezone issues
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Local date without time
    
    console.log(`Today: ${today.toDateString()} (day of week: ${today.getDay()})`);

    if (periodType === 'month') {
      // Start of current month (using UTC to avoid timezone issues)
      const year = today.getFullYear();
      const month = today.getMonth();
      const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
      const result = startOfMonth.toISOString().split('T')[0];
      console.log(`Month start calculated: ${result}`);
      return result;
    } else if (periodType === 'week') {
      // Start of current week (Monday)
      const day = today.getDay();
      
      // Calculate days to subtract to get to Monday
      // Sunday = 0, Monday = 1, Tuesday = 2, ..., Saturday = 6
      // Days to go back: Sunday=6, Monday=0, Tuesday=1, Wednesday=2, Thursday=3, Friday=4, Saturday=5
      const daysToMonday = day === 0 ? 6 : day - 1;
      
      console.log(`Days to Monday: ${daysToMonday}`);
      
      // Use UTC date calculation to avoid timezone issues
      const startOfWeek = new Date(Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - daysToMonday,
        0, 0, 0, 0
      ));
      
      const result = startOfWeek.toISOString().split('T')[0];
      console.log(`Week start calculated: ${result} (${startOfWeek.toDateString()})`);
      return result;
    }

    const result = today.toISOString().split('T')[0];
    console.log(`Default start: ${result}`);
    return result;
  }, []);

  const getCalculatedEndDate = useCallback((periodType: PeriodType) => {
    console.log(`=== getCalculatedEndDate ===`);
    console.log(`Period type: ${periodType}`);
    
    if (periodType === 'month') {
      // Last day of current month (using UTC to avoid timezone issues)
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)); // Last day of current month
      const result = endOfMonth.toISOString().split('T')[0];
      console.log(`Month end calculated: ${result}`);
      return result;
    } else if (periodType === 'week') {
      // End of current week (Sunday) - 6 days after Monday
      const startDateStr = getCalculatedStartDate(periodType);
      const startDate = new Date(startDateStr + 'T00:00:00.000Z');
      
      console.log(`Week start date for end calculation: ${startDateStr}`);
      
      // Calculate end date using UTC
      const endOfWeek = new Date(Date.UTC(
        startDate.getUTCFullYear(),
        startDate.getUTCMonth(),
        startDate.getUTCDate() + 6,
        23, 59, 59, 999
      ));
      
      const result = endOfWeek.toISOString().split('T')[0];
      console.log(`Week end calculated: ${result} (${endOfWeek.toDateString()})`);
      return result;
    }

    // Default 30 days for custom
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 30);
    const result = endDate.toISOString().split('T')[0];
    console.log(`Default end: ${result}`);
    return result;
  }, [getCalculatedStartDate]);

  // Initialize dates when period type changes
  const [previousPeriodType, setPreviousPeriodType] =
    useState<PeriodType>('month');

  useEffect(() => {
    console.log(`=== useEffect period change ===`);
    console.log(`Current period: ${formData.period_type}`);
    console.log(`Previous period: ${previousPeriodType}`);
    console.log(`Period changed: ${formData.period_type !== previousPeriodType}`);
    console.log(`Is custom: ${formData.period_type === 'custom'}`);
    
    if (
      formData.period_type !== previousPeriodType &&
      formData.period_type !== 'custom'
    ) {
      console.log(`Updating dates for period: ${formData.period_type}`);
      const startDate = getCalculatedStartDate(formData.period_type);
      const endDate = getCalculatedEndDate(formData.period_type);
      console.log(`Calculated dates: ${startDate} to ${endDate}`);
      console.log(`Previous form dates: ${formData.custom_start_date} to ${formData.custom_end_date}`);
      
      setFormData(prev => {
        console.log(`Setting new dates: ${startDate} to ${endDate}`);
        return {
          ...prev,
          custom_start_date: startDate,
          custom_end_date: endDate,
        };
      });
    }
    setPreviousPeriodType(formData.period_type);
  }, [
    formData.period_type,
    previousPeriodType,
    getCalculatedStartDate,
    getCalculatedEndDate,
  ]);

  useEffect(() => {
    if (visible) {
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
    }
  }, [visible, budget, resetForm]);

  const loadFormData = async () => {
    try {
      setLoadingData(true);
      console.log('Loading categories and currencies...');

      const [categoriesData, _currenciesResponse, userData] = await Promise.all([
        apiService.get<Category[]>('/categories'),
        apiService.get<{ currencies: Currency[] }>('/currencies'),
        apiService.getCurrentUser(),
      ]);

      console.log('Categories loaded:', categoriesData);
      console.log('Categories count:', categoriesData?.length || 0);
      console.log('Currencies response loaded:', _currenciesResponse);
      console.log(
        'Currencies count:',
        _currenciesResponse?.currencies?.length || 0,
      );

      const finalCategories = categoriesData || [];
      const finalCurrencies = _currenciesResponse?.currencies || [];

      setCategories(finalCategories);
      setCurrencies(finalCurrencies);

      // Set user's primary currency as default
      if (userData?.primaryCurrency?.code) {
        setUserPrimaryCurrency(userData.primaryCurrency.code);
        console.log('User primary currency:', userData.primaryCurrency.code);
        
        // Update form data if not editing existing budget
        if (!isEditing) {
          setFormData(prev => ({
            ...prev,
            currency: userData.primaryCurrency.code
          }));
        }
      }

      console.log('Final categories set:', finalCategories.length);
      console.log('Final currencies set:', finalCurrencies.length);

      // Дополнительное логирование для отладки
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
        `Failed to load data: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = useCallback(() => {
    console.log(`=== resetForm ===`);
    const startDate = getCalculatedStartDate('month');
    const endDate = getCalculatedEndDate('month');
    console.log(`resetForm setting dates: ${startDate} to ${endDate}`);
    console.log(`resetForm using primary currency: ${userPrimaryCurrency}`);
    setFormData({
      name: '',
      limit_amount: '',
      currency: userPrimaryCurrency,
      period_type: 'month',
      rollover: false,
      categories: [],
      custom_start_date: startDate,
      custom_end_date: endDate,
    });
  }, [getCalculatedStartDate, getCalculatedEndDate, userPrimaryCurrency]);

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
      // Always use dates from form fields (they are already calculated correctly)
      const startDate = formData.custom_start_date;
      const endDate = formData.custom_end_date;

      // Validate dates
      if (!startDate || !endDate) {
        Alert.alert('Error', 'Invalid period dates');
        return;
      }

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

      if (isEditing) {
        await updateBudget.mutateAsync({
          id: budget!.id,
          ...budgetData,
        });
      } else {
        await createBudget.mutateAsync(budgetData);
      }

      onSuccess();
      onClose();
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
              await deleteBudget.mutateAsync(budget.id);
              onSuccess();
              onClose();
            } catch (error) {
              console.error('Error deleting budget:', error);
              Alert.alert('Error', 'Failed to delete budget');
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

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  // Debug logging for render
  console.log(`=== BudgetFormModal RENDER ===`);
  console.log(`formData.period_type: ${formData.period_type}`);
  console.log(`formData.custom_start_date: ${formData.custom_start_date}`);
  console.log(`formData.custom_end_date: ${formData.custom_end_date}`);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={24} color="#000" />
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

        {loadingData ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9DEAFB" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <TouchableWithoutFeedback onPress={() => setShowCurrencyPicker(false)}>
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}>
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
                  onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
                >
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
                  'Default: start to end of current month (you can edit these dates)'}
                {formData.period_type === 'week' &&
                  'Default: Monday to Sunday of current week (you can edit these dates)'}
                {formData.period_type === 'custom' &&
                  'Set your custom start and end dates'}
              </Text>
              <View style={styles.dateFieldsContainer}>
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>Start Date</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    value={formData.custom_start_date}
                    onChangeText={text =>
                      setFormData(prev => ({
                        ...prev,
                        custom_start_date: text,
                      }))
                    }
                    editable={true}
                  />
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.dateLabel}>End Date</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    value={formData.custom_end_date}
                    onChangeText={text =>
                      setFormData(prev => ({
                        ...prev,
                        custom_end_date: text,
                      }))
                    }
                    editable={true}
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
                  <Text style={styles.rolloverTitle}>
                    Rollover unused amount
                  </Text>
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
                          formData.categories.includes(
                            category.id.toString(),
                          ) && styles.categoryButtonTextActive,
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
              <View style={styles.section}>
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
          </TouchableWithoutFeedback>
        )}
        
        {/* Currency Picker Overlay */}
        {showCurrencyPicker && (
          <View style={styles.currencyPickerOverlay}>
            <TouchableWithoutFeedback onPress={() => setShowCurrencyPicker(false)}>
              <View style={styles.currencyPickerBackdrop} />
            </TouchableWithoutFeedback>
            <View style={styles.currencyPickerModal}>
              <ScrollView 
                style={styles.currencyScrollView}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {currencies.map(currency => (
                  <TouchableOpacity
                    key={currency.code}
                    style={[
                      styles.currencyOption,
                      formData.currency === currency.code && styles.currencyOptionActive
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, currency: currency.code }));
                      setShowCurrencyPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.currencyOptionText,
                      formData.currency === currency.code && styles.currencyOptionTextActive
                    ]}>
                      {currency.code} - {currency.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 8,
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
    fontSize: 16,
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
