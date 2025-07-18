import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Dimensions } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { theme } from '../../styles/theme';
import { ToolsGrid as ToolsGridType, FinancialTool, SectionComponentProps } from '../../types/discover';

const { width: screenWidth } = Dimensions.get('window');

interface ToolsGridProps extends SectionComponentProps {
  data: ToolsGridType;
}

interface ToolItemProps {
  item: FinancialTool;
  onPress: (item: FinancialTool) => void;
}

const ToolItem: React.FC<ToolItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.toolItem}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} tool`}
      hitSlop={theme.spacing.sm}
    >
      <View style={styles.toolIconContainer}>
        {item.iconType === 'emoji' ? (
          <Text style={styles.toolEmojiIcon}>{item.iconName}</Text>
        ) : (
          <FontAwesome5 
            name={item.iconName} 
            size={32} 
            color={theme.colors.primary} 
          />
        )}
      </View>
      
      <Text style={styles.toolTitle} numberOfLines={2}>
        {item.title}
      </Text>
      
      <Text style={styles.toolDescription} numberOfLines={3}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );
};

export const ToolsGrid: React.FC<ToolsGridProps> = ({ data, onNavigation, onAnalytics }) => {
  const handleToolPress = (item: FinancialTool) => {
    onAnalytics({
      event: 'financial_tool_tap',
      properties: {
        toolId: item.id,
        toolTitle: item.title,
        category: 'financial_tools',
      },
    });

    if (item.action === 'navigation') {
      onNavigation(item.target, item.params);
    }
  };

  const renderToolItem = ({ item }: { item: FinancialTool }) => (
    <ToolItem item={item} onPress={handleToolPress} />
  );

  const getItemWidth = () => {
    const horizontalPadding = theme.spacing.lg * 2; // Left and right padding
    const gapWidth = theme.spacing.md * (data.numColumns - 1); // Gaps between items
    const availableWidth = screenWidth - horizontalPadding - gapWidth;
    return availableWidth / data.numColumns;
  };

  const renderGridItem = ({ item, index }: { item: FinancialTool; index: number }) => (
    <View style={[styles.gridItemContainer, { width: getItemWidth() }]}>
      <ToolItem item={item} onPress={handleToolPress} />
    </View>
  );

  if (!data.tools || data.tools.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{data.title}</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No tools available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>{data.title}</Text>
      </View>
      
      <FlatList
        data={data.tools}
        renderItem={renderGridItem}
        keyExtractor={(item) => item.id}
        numColumns={data.numColumns}
        scrollEnabled={false}
        columnWrapperStyle={data.numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.gridContent}
        ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  titleContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
  },
  gridContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  row: {
    justifyContent: 'space-between',
  },
  rowSeparator: {
    height: theme.spacing.md,
  },
  gridItemContainer: {
    // Width is set dynamically
  },
  toolItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    height: theme.dimensions.toolGridItemHeight,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.card,
  },
  toolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  toolEmojiIcon: {
    fontSize: 32,
  },
  toolTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  toolDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
  },
  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});