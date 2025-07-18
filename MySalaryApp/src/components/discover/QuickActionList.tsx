import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { theme } from '../../styles/theme';
import { QuickAction, SectionComponentProps } from '../../types/discover';
import { useDiscoverStore } from '../../stores/discoverStore';

interface QuickActionListProps extends SectionComponentProps {
  data: {
    id: string;
    title: string;
    actions: QuickAction[];
  };
}

interface QuickActionItemProps {
  action: QuickAction;
  onPress: (action: QuickAction) => void;
}

const QuickActionItem: React.FC<QuickActionItemProps> = ({ action, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.actionItem}
      onPress={() => onPress(action)}
      accessibilityRole="button"
      accessibilityLabel={`${action.title} button`}
      hitSlop={theme.spacing.sm}
    >
      <View style={styles.iconContainer}>
        {action.iconType === 'emoji' ? (
          <Text style={styles.emojiIcon}>{action.iconName}</Text>
        ) : (
          <FontAwesome5 
            name={action.iconName} 
            size={24} 
            color={theme.colors.primary} 
          />
        )}
      </View>
      <Text style={styles.actionTitle} numberOfLines={2}>
        {action.title}
      </Text>
    </TouchableOpacity>
  );
};

export const QuickActionList: React.FC<QuickActionListProps> = ({ 
  data, 
  onNavigation, 
  onAnalytics 
}) => {
  const { quickActions, incrementUsageCount } = useDiscoverStore();
  
  // Use sorted actions from store if available, otherwise use data
  const sortedActions = quickActions.length > 0 
    ? quickActions 
    : data.actions.sort((a, b) => b.usageCount - a.usageCount);

  const handleActionPress = (action: QuickAction) => {
    // Track analytics
    onAnalytics({
      event: 'quick_action_tap',
      properties: {
        actionId: action.id,
        actionTitle: action.title,
        usageCount: action.usageCount
      }
    });

    // Increment usage count
    incrementUsageCount(action.id);

    // Navigate
    if (action.action === 'navigation') {
      onNavigation(action.target, action.params);
    } else if (action.action === 'modal') {
      // For modal presentation
      onNavigation(action.target, { ...action.params, presentation: 'modal' });
    }
  };

  const renderActionItem = ({ item }: { item: QuickAction }) => (
    <QuickActionItem 
      action={item} 
      onPress={handleActionPress} 
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedActions}
        renderItem={renderActionItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingVertical: theme.spacing.xs,
  },
  separator: {
    width: theme.spacing.md,
  },
  actionItem: {
    width: theme.dimensions.quickActionWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: theme.dimensions.quickActionIconSize,
    height: theme.dimensions.quickActionIconSize,
    borderRadius: theme.dimensions.quickActionIconSize / 2,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  emojiIcon: {
    fontSize: 24,
  },
  actionTitle: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 14,
  },
});