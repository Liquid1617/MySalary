import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Alert,
  StyleSheet,
} from 'react-native';
import GradientHeader from '../components/GradientHeader';
import FeedSection from '../components/FeedSection';
import { ContentCarousel } from '../components/ContentCarousel';
import { Article } from '../components/Article';
import { MOCK_SECTIONS, Section, Item } from '../mock/discoverFeed';
import { getCarouselContent } from '../mock/carouselContent';
import { getArticleContent } from '../mock/articleContent';
import { colors } from '../styles';

export const DiscoverScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [carouselVisible, setCarouselVisible] = useState(false);
  const [currentCarouselContent, setCurrentCarouselContent] = useState<any>(null);
  const [articleVisible, setArticleVisible] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<any>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = () => {
    // Simulate initial data loading
    setSections(MOCK_SECTIONS);
  };

  const onRefresh = async () => {
    setLoading(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setSections(MOCK_SECTIONS);
      setLoading(false);
    }, 1500);
  };

  const onItemPress = (item: Item) => {
    // Check if this item has carousel content
    const carouselContent = getCarouselContent(item.id);
    
    if (carouselContent) {
      setCurrentCarouselContent(carouselContent);
      setCarouselVisible(true);
      return;
    }

    // Check if this item has article content
    const articleContent = getArticleContent(item.id);
    
    if (articleContent) {
      setCurrentArticle(articleContent);
      setArticleVisible(true);
      return;
    }

    // Fallback for items without specific content
    Alert.alert('Content Selected', `You selected: ${item.title}`);
  };

  const onShowMore = (section: Section) => {
    Alert.alert('Show More', `Show more content for: ${section.title}`);
  };

  const onAvatarPress = () => {
    Alert.alert('Profile', 'Navigate to profile');
  };

  const onCtaPress = () => {
    Alert.alert('CTA', 'Meet Ellroy feature coming soon!');
  };

  const onCloseCarousel = () => {
    setCarouselVisible(false);
    setCurrentCarouselContent(null);
  };

  const onCloseArticle = () => {
    setArticleVisible(false);
    setCurrentArticle(null);
  };

  const onArticlePress = (articleId: string) => {
    // Handle navigation to related articles
    const articleContent = getArticleContent(articleId);
    
    if (articleContent) {
      setCurrentArticle(articleContent);
      // Article modal is already visible, just update content
    } else {
      Alert.alert('Article not found', 'This article is not available yet.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <GradientHeader
        title="Discover"
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} />
        }>
        <View style={styles.content}>
          {sections.map(section => (
            <FeedSection
              key={section.id}
              section={section}
              onItemPress={onItemPress}
              onShowMore={onShowMore}
            />
          ))}
        </View>
      </ScrollView>

      {/* Carousel Modal */}
      {currentCarouselContent && (
        <ContentCarousel
          visible={carouselVisible}
          onClose={onCloseCarousel}
          cards={currentCarouselContent.cards}
          title={currentCarouselContent.title}
        />
      )}

      {/* Article Modal */}
      {currentArticle && (
        <Article
          visible={articleVisible}
          onClose={onCloseArticle}
          article={currentArticle}
          onArticlePress={onArticlePress}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },
});
