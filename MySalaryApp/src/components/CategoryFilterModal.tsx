import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { apiService } from '../services/api';
import { colors } from '../styles';

interface Category {
  id: number;
  name?: string;
  category_name?: string;
  type?: string;
  category_type?: string;
  icon?: string;
  color?: string;
}

interface CategoryFilterModalProps {
  visible: boolean;
  selectedCategories: number[];
  onClose: () => void;
  onApply: (categoryIds: number[]) => void;
}

export const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  visible,
  selectedCategories,
  onClose,
  onApply,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempSelectedCategories, setTempSelectedCategories] = useState<number[]>(selectedCategories);

  useEffect(() => {
    if (visible) {
      loadCategories();
      setTempSelectedCategories(selectedCategories);
    }
  }, [visible, selectedCategories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiService.get<Category[]>('/categories');
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName: string, categoryType: string) => {
    // Income category icons
    if (categoryType === 'income') {
      switch (categoryName.toLowerCase()) {
        case 'salary':
          return 'money-bill-wave';
        case 'bonus & rewards':
          return 'gift';
        case 'freelance':
          return 'laptop';
        case 'investments':
          return 'chart-line';
        case 'sales & trade':
          return 'handshake';
        case 'rental income':
          return 'home';
        case 'pension & benefits':
          return 'shield-alt';
        case 'scholarship':
          return 'graduation-cap';
        case 'gifts & inheritance':
          return 'gift';
        case 'tax refund':
          return 'file-invoice-dollar';
        case 'cashback':
          return 'credit-card';
        case 'other income':
          return 'plus-circle';
        default:
          return 'arrow-up';
      }
    }

    // Expense category icons
    switch (categoryName.toLowerCase()) {
      case 'food & groceries':
        return 'shopping-cart';
      case 'transportation':
        return 'car';
      case 'utilities':
        return 'bolt';
      case 'entertainment':
        return 'gamepad';
      case 'clothing & shoes':
        return 'tshirt';
      case 'healthcare':
        return 'heartbeat';
      case 'education':
        return 'graduation-cap';
      case 'home & garden':
        return 'home';
      case 'loans & credit':
        return 'credit-card';
      case 'sports & fitness':
        return 'dumbbell';
      case 'travel':
        return 'plane';
      case 'restaurants & cafes':
        return 'utensils';
      case 'gas & parking':
        return 'gas-pump';
      case 'beauty & care':
        return 'spa';
      case 'gifts':
        return 'gift';
      case 'other expenses':
        return 'ellipsis-h';
      default:
        return 'arrow-down';
    }
  };

  const toggleCategory = (categoryId: number) => {
    setTempSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const selectAll = () => {
    setTempSelectedCategories(categories.map(cat => cat.id));
  };

  const clearAll = () => {
    setTempSelectedCategories([]);
  };

  const handleApply = () => {
    onApply(tempSelectedCategories);
    onClose();
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const categoryName = item.category_name || item.name || '';
    const categoryType = item.category_type || item.type || '';
    const isSelected = tempSelectedCategories.includes(item.id);
    const iconName = getCategoryIcon(categoryName, categoryType);
    const iconColor = categoryType === 'income' ? '#34C759' : '#FF3B30';

    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
        onPress={() => toggleCategory(item.id)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: `${iconColor}15` }]}>
          <FontAwesome5 name={iconName} size={20} color={iconColor} />
        </View>
        <Text style={styles.categoryName}>{categoryName}</Text>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <FontAwesome5 name="check" size={12} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  const expenseCategories = categories.filter(cat => 
    (cat.category_type || cat.type) === 'expense'
  );
  const incomeCategories = categories.filter(cat => 
    (cat.category_type || cat.type) === 'income'
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome5 name="times" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filter by Category</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton} onPress={selectAll}>
            <Text style={styles.quickActionText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={clearAll}>
            <Text style={styles.quickActionText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={[
              { type: 'header', title: 'Expenses' },
              ...expenseCategories,
              { type: 'header', title: 'Income' },
              ...incomeCategories,
            ]}
            keyExtractor={(item, index) => 
              item.type === 'header' ? `header-${index}` : `category-${item.id}`
            }
            renderItem={({ item }) => {
              if (item.type === 'header') {
                return (
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{item.title}</Text>
                  </View>
                );
              }
              return renderCategory({ item: item as Category });
            }}
            contentContainerStyle={styles.listContent}
          />
        )}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.applyButton, tempSelectedCategories.length === 0 && styles.applyButtonDisabled]} 
            onPress={handleApply}
            disabled={tempSelectedCategories.length === 0}
          >
            <Text style={styles.applyButtonText}>
              Apply ({tempSelectedCategories.length})
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 36,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryItemSelected: {
    backgroundColor: '#F0F8FF',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: colors.border,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});