import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator 
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { BudgetCard } from './BudgetCard';
import { useBudgets } from '../hooks/useBudgets';
import { BudgetResponse } from '../types/budget';

interface BudgetCarouselProps {
  onBudgetPress: (budget: BudgetResponse) => void;
  onCreateBudget: () => void;
  onAnalytics: (event: string, properties: any) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const BudgetCarousel: React.FC<BudgetCarouselProps> = ({
  onBudgetPress,
  onCreateBudget,
  onAnalytics,
}) => {
  const { data: budgets, isLoading, error } = useBudgets();

  const handleBudgetPress = (budget: BudgetResponse) => {
    onAnalytics('budget_card_click', { id: budget.id });
    onBudgetPress(budget);
  };

  const renderBudgetCard = ({ item }: { item: BudgetResponse | 'add_new' }) => {
    if (item === 'add_new') {
      return (
        <View style={styles.addBudgetCard}>
          <TouchableOpacity
            style={styles.addBudgetButton}
            onPress={onCreateBudget}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Add new budget"
          >
            <View style={styles.addBudgetIcon}>
              <FontAwesome5 name="plus" size={24} color="#9DEAFB" />
            </View>
            <Text style={styles.addBudgetText}>Add Budget</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <BudgetCard
        budget={item}
        onPress={handleBudgetPress}
        onAnalytics={onAnalytics}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateContent}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustrationCircle}>
            <FontAwesome5 name="chart-pie" size={32} color="#9CA3AF" />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.emptyStateTitle}>No budgets yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Create your first budget to track spending
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onCreateBudget}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Create first budget"
        >
          <FontAwesome5 name="plus" size={16} color="#FFFFFF" style={styles.ctaIcon} />
          <Text style={styles.ctaText}>Create first budget</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#9DEAFB" />
      <Text style={styles.loadingText}>Loading budgets...</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <View style={styles.errorContent}>
        <FontAwesome5 name="exclamation-triangle" size={24} color="#EF4444" />
        <Text style={styles.errorTitle}>Failed to load budgets</Text>
        <Text style={styles.errorSubtitle}>Please try again later</Text>
      </View>
    </View>
  );

  // Don't render anything if there's an error
  if (error) {
    return renderErrorState();
  }

  // Show loading state
  if (isLoading) {
    return renderLoadingState();
  }

  // Show empty state if no budgets
  if (!budgets || budgets.length === 0) {
    return renderEmptyState();
  }

  // Add "add_new" button to the end of budgets list
  const dataWithAddButton = [...budgets, 'add_new'];

  return (
    <View style={styles.container}>
      <FlatList
        data={dataWithAddButton}
        renderItem={renderBudgetCard}
        keyExtractor={(item) => typeof item === 'string' ? item : item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth * 0.86 + 8} // Card width + separator
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  carouselContent: {
    paddingHorizontal: 8,
  },
  separator: {
    width: 8,
  },

  // Add Budget Card
  addBudgetCard: {
    width: screenWidth * 0.86,
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  addBudgetButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  addBudgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#9DEAFB',
    borderStyle: 'dashed',
  },
  addBudgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9DEAFB',
  },
  
  // Empty State
  emptyStateContainer: {
    width: screenWidth - 48, // Full width minus padding
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    marginBottom: 12,
  },
  illustrationCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9DEAFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ctaIcon: {
    marginRight: 8,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },

  // Loading State
  loadingContainer: {
    width: screenWidth - 48, // Full width minus padding
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },

  // Error State
  errorContainer: {
    width: screenWidth - 48, // Full width minus padding
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  errorContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
});