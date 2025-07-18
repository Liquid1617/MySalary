import React, { useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { useDiscoverStore } from '../stores/discoverStore';
import { DiscoverSection, AnalyticsEvent } from '../types/discover';
import { 
  HeroCard, 
  QuickActionList, 
  Carousel, 
  RecoList, 
  ToolsGrid, 
  HubBanners, 
  StoryChips, 
  PromoBanner 
} from '../components/discover';

export const NewDiscoverScreen: React.FC = () => {
  const navigation = useNavigation();
  const { 
    sections, 
    refreshing, 
    loadInitialData, 
    refresh 
  } = useDiscoverStore();

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const handleNavigation = useCallback((target: string, params?: Record<string, any>) => {
    // TODO: Implement navigation based on target
    console.log('Navigate to:', target, params);
    
    // Example navigation logic
    switch (target) {
      case 'LimitCreation':
        // navigation.navigate('LimitCreation', params);
        break;
      case 'ExpenseForm':
        // navigation.navigate('ExpenseForm', { presentation: 'modal' });
        break;
      default:
        console.warn('Unknown navigation target:', target);
    }
  }, []);

  const handleAnalytics = useCallback((event: AnalyticsEvent) => {
    // TODO: Implement analytics with @segment/analytics-react-native
    console.log('Analytics event:', event);
  }, []);

  const renderSection = useCallback(({ item }: { item: DiscoverSection }) => {
    switch (item.type) {
      case 'HeroFocusCard':
        return (
          <HeroCard
            data={item.data}
            onNavigation={handleNavigation}
            onAnalytics={handleAnalytics}
          />
        );
      
      case 'QuickActionsRow':
        return (
          <QuickActionList
            data={item.data}
            onNavigation={handleNavigation}
            onAnalytics={handleAnalytics}
          />
        );
      
      case 'LearnAndDoCarousel':
        return (
          <Carousel
            data={item.data}
            onNavigation={handleNavigation}
            onAnalytics={handleAnalytics}
          />
        );
      
      case 'PersonalRecoList':
        return (
          <RecoList
            data={item.data}
            onNavigation={handleNavigation}
            onAnalytics={handleAnalytics}
          />
        );
      
      case 'ToolsGrid':
        return (
          <ToolsGrid
            data={item.data}
            onNavigation={handleNavigation}
            onAnalytics={handleAnalytics}
          />
        );
      
      case 'TopicHubs':
        return (
          <HubBanners
            data={item.data}
            onNavigation={handleNavigation}
            onAnalytics={handleAnalytics}
          />
        );
      
      case 'CommunityStories':
        return (
          <StoryChips
            data={item.data}
            onNavigation={handleNavigation}
            onAnalytics={handleAnalytics}
          />
        );
      
      case 'FeaturedPromo':
        return (
          <PromoBanner
            data={item.data}
            onNavigation={handleNavigation}
            onAnalytics={handleAnalytics}
          />
        );
      
      case 'BottomSafePad':
        return <View style={{ height: item.data.height }} />;
      
      default:
        // Placeholder for unimplemented sections
        return (
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderText}>
              {item.type} - Coming Soon
            </Text>
          </View>
        );
    }
  }, [handleNavigation, handleAnalytics]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Discover</Text>
    </View>
  ), []);

  const keyExtractor = useCallback((item: DiscoverSection) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sections}
        renderItem={renderSection}
        keyExtractor={keyExtractor}
        ListHeaderComponent={renderHeader}
        refreshing={refreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: theme.spacing.lg,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  placeholderSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  placeholderText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});