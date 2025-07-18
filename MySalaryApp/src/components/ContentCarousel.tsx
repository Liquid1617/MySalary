import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../styles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface CarouselCard {
  id: string;
  type: 'question' | 'info' | 'visual';
  title: string;
  content: string;
  question?: string;
  options?: { id: string; text: string }[];
  correctAnswer?: string;
  explanation?: string;
  gradient?: string[];
  illustration?: string;
  relatedContent?: { id: string; title: string; description: string }[];
}

interface ContentCarouselProps {
  visible: boolean;
  onClose: () => void;
  cards: CarouselCard[];
  title: string;
}

export const ContentCarousel: React.FC<ContentCarouselProps> = ({
  visible,
  onClose,
  cards,
  title,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderMove: (evt, gestureState) => {
      translateX.setValue(gestureState.dx);
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 50 && currentIndex > 0) {
        goToPrevious();
      } else if (gestureState.dx < -50 && currentIndex < cards.length - 1) {
        goToNext();
      }
      
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
  });

  const goToNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleAnswerSelect = (answerId: string) => {
    setSelectedAnswer(answerId);
    setShowExplanation(true);
  };

  const renderQuestionCard = (card: CarouselCard) => (
    <LinearGradient
      colors={card.gradient || ['#E8F4FD', '#B3E5FC']}
      style={styles.cardContent}>
      <View style={styles.questionHeader}>
        <View style={styles.questionBadge}>
          <Text style={styles.questionBadgeText}>QUESTION</Text>
        </View>
      </View>
      
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{card.question}</Text>
      </View>

      {card.illustration && (
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustrationPlaceholder}>
            {card.illustration}
          </Text>
        </View>
      )}

      {!showExplanation && (
        <View style={styles.optionsContainer}>
          {card.options?.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                selectedAnswer === option.id && styles.selectedOption,
              ]}
              onPress={() => handleAnswerSelect(option.id)}>
              <Text style={styles.optionLabel}>{option.id}</Text>
              <Text style={styles.optionText}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {showExplanation && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationText}>{card.explanation}</Text>
          {card.relatedContent && (
            <View style={styles.relatedContentContainer}>
              <Text style={styles.relatedContentTitle}>MORE ABOUT {title.toUpperCase()}</Text>
              <View style={styles.relatedCards}>
                {card.relatedContent.map((item, index) => (
                  <TouchableOpacity key={item.id} style={styles.relatedCard}>
                    <View style={[styles.relatedCardImage, { backgroundColor: index % 2 === 0 ? '#FFB3BA' : '#B3E5FC' }]}>
                      <Text style={styles.relatedCardEmoji}>
                        {index % 2 === 0 ? '☕' : '💡'}
                      </Text>
                    </View>
                    <Text style={styles.relatedCardTitle}>{item.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={styles.nextArticleButton}>
                <Text style={styles.nextArticleText}>Next article</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </LinearGradient>
  );

  const renderInfoCard = (card: CarouselCard) => (
    <LinearGradient
      colors={card.gradient || ['#F3E5F5', '#E1BEE7']}
      style={styles.cardContent}>
      <Text style={styles.infoTitle}>{card.title}</Text>
      <Text style={styles.infoContent}>{card.content}</Text>
    </LinearGradient>
  );

  const renderCard = (card: CarouselCard) => {
    switch (card.type) {
      case 'question':
        return renderQuestionCard(card);
      case 'info':
        return renderInfoCard(card);
      default:
        return renderInfoCard(card);
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
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome5 name="times" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / cards.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Card Content */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}>
          {renderCard(cards[currentIndex])}
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
            onPress={goToPrevious}
            disabled={currentIndex === 0}>
            <FontAwesome5 name="arrow-left" size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.likeButton}>
            <FontAwesome5 name="thumbs-up" size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dislikeButton}>
            <FontAwesome5 name="thumbs-down" size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.bookmarkButton}>
            <FontAwesome5 name="bookmark" size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton}>
            <FontAwesome5 name="share" size={20} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentIndex === cards.length - 1 && styles.navButtonDisabled]}
            onPress={goToNext}
            disabled={currentIndex === cards.length - 1}>
            <FontAwesome5 name="arrow-right" size={20} color={colors.white} />
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
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'center',
  },
  questionHeader: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
  questionBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  questionBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  questionContainer: {
    marginTop: 60,
    marginBottom: 40,
  },
  questionText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 38,
    textAlign: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationPlaceholder: {
    fontSize: 120,
    opacity: 0.8,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginRight: 16,
    minWidth: 24,
  },
  optionText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  explanationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  explanationText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  relatedContentContainer: {
    marginTop: 20,
  },
  relatedContentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  relatedCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  relatedCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  relatedCardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  relatedCardEmoji: {
    fontSize: 24,
  },
  relatedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 18,
  },
  nextArticleButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextArticleText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  likeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dislikeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});