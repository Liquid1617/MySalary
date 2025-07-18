import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Linking } from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../styles/theme';
import { PersonalRecoList, PersonalRecommendation, SectionComponentProps } from '../../types/discover';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

interface RecoListProps extends SectionComponentProps {
  data: PersonalRecoList;
}

interface RecoItemProps {
  item: PersonalRecommendation;
  onPress: (item: PersonalRecommendation) => void;
}

const RecoItem: React.FC<RecoItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.recoItem}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} recommendation`}
    >
      {item.imageUrl && (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.recoImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.recoContent}>
        <Text style={styles.recoTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.recoDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.recoCategoryContainer}>
          <Text style={styles.recoCategory}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ShimmerRecoItem: React.FC = () => {
  return (
    <View style={styles.recoItem}>
      <ShimmerPlaceholder 
        style={styles.recoImage}
        shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
      />
      <View style={styles.recoContent}>
        <ShimmerPlaceholder 
          style={styles.shimmerTitle}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />
        <ShimmerPlaceholder 
          style={styles.shimmerDescription}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />
        <ShimmerPlaceholder 
          style={styles.shimmerCategory}
          shimmerColors={['#f0f0f0', '#e0e0e0', '#f0f0f0']}
        />
      </View>
    </View>
  );
};

export const RecoList: React.FC<RecoListProps> = ({ data, onNavigation, onAnalytics }) => {
  const handleRecoPress = async (item: PersonalRecommendation) => {
    onAnalytics({
      event: 'personal_reco_tap',
      properties: {
        recoId: item.id,
        recoTitle: item.title,
        category: item.category,
        priority: item.priority,
      },
    });

    try {
      const supported = await Linking.canOpenURL(item.url);
      if (supported) {
        await Linking.openURL(item.url);
      } else {
        console.warn('Cannot open URL:', item.url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  const renderRecoItem = ({ item }: { item: PersonalRecommendation }) => (
    <RecoItem item={item} onPress={handleRecoPress} />
  );

  const renderShimmerItem = ({ index }: { index: number }) => (
    <ShimmerRecoItem key={`shimmer-${index}`} />
  );

  if (!data.mlReady) {
    // TODO-ML-PERSONAL_RECO
    // Replace placeholder with real data when endpoint ready
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{data.title}</Text>
          <Text style={styles.subtitle}>Getting personalized recommendations...</Text>
        </View>
        
        <FlatList
          data={Array.from({ length: data.placeholderCount }, (_, index) => index)}
          renderItem={renderShimmerItem}
          keyExtractor={(item) => `shimmer-${item}`}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    );
  }

  if (!data.recommendations || data.recommendations.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{data.title}</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No recommendations available</Text>
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
        data={data.recommendations}
        renderItem={renderRecoItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  separator: {
    height: theme.spacing.sm,
  },
  recoItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    minHeight: 80,
    ...theme.shadows.card,
  },
  recoImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  recoContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recoTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  recoDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  recoCategoryContainer: {
    alignSelf: 'flex-start',
  },
  recoCategory: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
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
  // Shimmer styles
  shimmerTitle: {
    height: 20,
    borderRadius: 4,
    marginBottom: theme.spacing.xs,
    width: '80%',
  },
  shimmerDescription: {
    height: 16,
    borderRadius: 4,
    marginBottom: theme.spacing.xs,
    width: '100%',
  },
  shimmerCategory: {
    height: 16,
    borderRadius: 4,
    width: '40%',
  },
});