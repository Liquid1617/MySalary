import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { theme } from '../../styles/theme';
import { TopicHubs, TopicHub, SectionComponentProps } from '../../types/discover';

interface HubBannersProps extends SectionComponentProps {
  data: TopicHubs;
}

interface HubBannerProps {
  hub: TopicHub;
  onPress: (hub: TopicHub) => void;
}

const HubBanner: React.FC<HubBannerProps> = ({ hub, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.hubBanner}
      onPress={() => onPress(hub)}
      accessibilityRole="button"
      accessibilityLabel={`${hub.title} hub`}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{ uri: hub.imageUrl }}
        style={styles.hubImageBackground}
        imageStyle={styles.hubImage}
      >
        <View style={styles.hubOverlay}>
          <View style={styles.hubContent}>
            <Text style={styles.hubTitle} numberOfLines={2}>
              {hub.title}
            </Text>
            <Text style={styles.hubDescription} numberOfLines={2}>
              {hub.description}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export const HubBanners: React.FC<HubBannersProps> = ({ data, onNavigation, onAnalytics }) => {
  const handleHubPress = (hub: TopicHub) => {
    onAnalytics({
      event: 'topic_hub_tap',
      properties: {
        hubId: hub.id,
        hubTitle: hub.title,
        category: 'topic_hubs',
      },
    });

    if (hub.action === 'navigation') {
      onNavigation(hub.target, hub.params);
    }
  };

  if (!data.hubs || data.hubs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{data.title}</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No topic hubs available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>{data.title}</Text>
      </View>
      
      <View style={styles.hubsContainer}>
        {data.hubs.map((hub) => (
          <HubBanner
            key={hub.id}
            hub={hub}
            onPress={handleHubPress}
          />
        ))}
      </View>
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
  hubsContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  hubBanner: {
    marginBottom: theme.spacing.sm,
  },
  hubImageBackground: {
    width: '100%',
    height: theme.dimensions.hubBannerHeight,
    justifyContent: 'flex-end',
  },
  hubImage: {
    borderRadius: theme.borderRadius.lg,
    resizeMode: 'cover',
  },
  hubOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    minHeight: theme.dimensions.hubBannerHeight,
    justifyContent: 'flex-end',
  },
  hubContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  hubTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.surface,
    marginBottom: theme.spacing.xs,
    fontWeight: '700',
  },
  hubDescription: {
    ...theme.typography.body,
    color: theme.colors.surface,
    opacity: 0.9,
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