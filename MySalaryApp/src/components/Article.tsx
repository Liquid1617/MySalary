import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../styles';

const { width: screenWidth } = Dimensions.get('window');

export interface ArticleSection {
  id: string;
  type: 'paragraph' | 'heading' | 'quote' | 'list' | 'image';
  content: string;
  items?: string[]; // for list type
  imageUrl?: string; // for image type
  caption?: string; // for image caption
}

export interface ArticleData {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  publishDate: string;
  readTime: number; // in minutes
  category: string;
  tags: string[];
  heroImage?: string;
  heroVector?: string; // emoji or vector icon
  gradient?: string[];
  sections: ArticleSection[];
  relatedArticles?: {
    id: string;
    title: string;
    description: string;
    readTime: number;
    category: string;
    heroVector?: string;
  }[];
}

interface ArticleProps {
  visible: boolean;
  onClose: () => void;
  article: ArticleData;
  onArticlePress?: (articleId: string) => void;
}

export const Article: React.FC<ArticleProps> = ({
  visible,
  onClose,
  article,
  onArticlePress,
}) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${article.title}`,
        title: article.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // TODO: Implement bookmark functionality
  };

  const handleLike = () => {
    setLiked(!liked);
    // TODO: Implement like functionality
  };

  const renderSection = (section: ArticleSection) => {
    switch (section.type) {
      case 'heading':
        return (
          <Text key={section.id} style={styles.sectionHeading}>
            {section.content}
          </Text>
        );
      
      case 'paragraph':
        return (
          <Text key={section.id} style={styles.paragraph}>
            {section.content}
          </Text>
        );
      
      case 'quote':
        return (
          <View key={section.id} style={styles.quoteContainer}>
            <View style={styles.quoteMark}>
              <FontAwesome5 name="quote-left" size={16} color={colors.primary} />
            </View>
            <Text style={styles.quoteText}>{section.content}</Text>
          </View>
        );
      
      case 'list':
        return (
          <View key={section.id} style={styles.listContainer}>
            {section.items?.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.listBullet} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'image':
        return (
          <View key={section.id} style={styles.imageContainer}>
            {section.imageUrl ? (
              <Image source={{ uri: section.imageUrl }} style={styles.sectionImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>📊</Text>
              </View>
            )}
            {section.caption && (
              <Text style={styles.imageCaption}>{section.caption}</Text>
            )}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <FontAwesome5 name="arrow-left" size={20} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <FontAwesome5 name="share" size={18} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
              <FontAwesome5 
                name={bookmarked ? "bookmark" : "bookmark"} 
                size={18} 
                color={bookmarked ? colors.primary : colors.text}
                solid={bookmarked}
              />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            {article.heroImage ? (
              <Image source={{ uri: article.heroImage }} style={styles.heroImage} />
            ) : (
              <LinearGradient
                colors={article.gradient || ['#667eea', '#764ba2']}
                style={styles.heroGradient}>
                <Text style={styles.heroVector}>
                  {article.heroVector || '💰'}
                </Text>
              </LinearGradient>
            )}
            
            <View style={styles.heroContent}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{article.category}</Text>
              </View>
              
              <Text style={styles.title}>{article.title}</Text>
              
              {article.subtitle && (
                <Text style={styles.subtitle}>{article.subtitle}</Text>
              )}
              
              <View style={styles.articleMeta}>
                <Text style={styles.author}>By {article.author}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.publishDate}>{article.publishDate}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.readTime}>{article.readTime} min read</Text>
              </View>
            </View>
          </View>

          {/* Article Content */}
          <View style={styles.articleContent}>
            {article.sections.map(renderSection)}
          </View>

          {/* Article Footer */}
          <View style={styles.footer}>
            <View style={styles.engagement}>
              <TouchableOpacity style={styles.engagementButton} onPress={handleLike}>
                <FontAwesome5 
                  name="heart" 
                  size={20} 
                  color={liked ? colors.error : colors.textSecondary}
                  solid={liked}
                />
                <Text style={[styles.engagementText, liked && styles.likedText]}>
                  {liked ? 'Liked' : 'Like'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.engagementButton} onPress={handleShare}>
                <FontAwesome5 name="share" size={20} color={colors.textSecondary} />
                <Text style={styles.engagementText}>Share</Text>
              </TouchableOpacity>
            </View>

            {/* Tags */}
            {article.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={styles.tagsTitle}>Tags:</Text>
                <View style={styles.tags}>
                  {article.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Related Articles */}
          {article.relatedArticles && article.relatedArticles.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Recommended for you</Text>
              
              {article.relatedArticles.map((relatedArticle, index) => (
                <TouchableOpacity
                  key={relatedArticle.id}
                  style={styles.relatedArticle}
                  onPress={() => onArticlePress?.(relatedArticle.id)}>
                  <View style={styles.relatedIcon}>
                    <Text style={styles.relatedVector}>
                      {relatedArticle.heroVector || '📄'}
                    </Text>
                  </View>
                  
                  <View style={styles.relatedContent}>
                    <Text style={styles.relatedArticleTitle}>
                      {relatedArticle.title}
                    </Text>
                    <Text style={styles.relatedDescription}>
                      {relatedArticle.description}
                    </Text>
                    <View style={styles.relatedMeta}>
                      <Text style={styles.relatedCategory}>
                        {relatedArticle.category}
                      </Text>
                      <Text style={styles.metaDot}>•</Text>
                      <Text style={styles.relatedReadTime}>
                        {relatedArticle.readTime} min
                      </Text>
                    </View>
                  </View>
                  
                  <FontAwesome5 name="chevron-right" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  heroGradient: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroVector: {
    fontSize: 80,
    opacity: 0.9,
  },
  heroContent: {
    padding: 24,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  categoryText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 40,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: 16,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  author: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 14,
    color: colors.textSecondary,
    marginHorizontal: 8,
  },
  publishDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  readTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  articleContent: {
    paddingHorizontal: 24,
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    marginTop: 32,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.text,
    marginBottom: 20,
  },
  quoteContainer: {
    backgroundColor: colors.backgroundLight,
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  quoteMark: {
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    fontStyle: 'italic',
  },
  listContainer: {
    marginVertical: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 10,
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
  },
  imageContainer: {
    marginVertical: 24,
  },
  sectionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 40,
    opacity: 0.6,
  },
  imageCaption: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginTop: 32,
  },
  engagement: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 32,
  },
  engagementButton: {
    alignItems: 'center',
    gap: 8,
  },
  engagementText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  likedText: {
    color: colors.error,
  },
  tagsContainer: {
    marginBottom: 32,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  relatedSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 32,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
  },
  relatedArticle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  relatedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  relatedVector: {
    fontSize: 20,
  },
  relatedContent: {
    flex: 1,
  },
  relatedArticleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  relatedDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  relatedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relatedCategory: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  relatedReadTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});