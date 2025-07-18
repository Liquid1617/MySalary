import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { theme } from '../../styles/theme';
import { LearnAndDoCarousel, CarouselCard, SectionComponentProps } from '../../types/discover';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselProps extends SectionComponentProps {
  data: LearnAndDoCarousel;
}

interface CarouselItemProps {
  item: CarouselCard;
  onPress: (item: CarouselCard) => void;
}

const CarouselItem: React.FC<CarouselItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.carouselItem}
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title} card`}
    >
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay}>
          {item.tag && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          )}
          <View style={styles.textContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={3}>
              {item.description}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

interface PaginationDotsProps {
  currentIndex: number;
  totalItems: number;
}

const PaginationDots: React.FC<PaginationDotsProps> = ({ currentIndex, totalItems }) => {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: totalItems }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentIndex ? styles.paginationDotActive : styles.paginationDotInactive,
          ]}
        />
      ))}
    </View>
  );
};

export const Carousel: React.FC<CarouselProps> = ({ data, onNavigation, onAnalytics }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (data.autoplay && data.cards.length > 1) {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % data.cards.length;
          flatListRef.current?.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
          return nextIndex;
        });
      }, data.autoplayInterval || 4000);
    }

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [data.autoplay, data.autoplayInterval, data.cards.length]);

  const handleCardPress = (item: CarouselCard) => {
    onAnalytics({
      event: 'carousel_card_tap',
      properties: {
        cardId: item.id,
        cardTitle: item.title,
        tag: item.tag,
        position: currentIndex,
      },
    });

    if (item.action === 'navigation') {
      onNavigation(item.target, item.params);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderCarouselItem = ({ item }: { item: CarouselCard }) => (
    <CarouselItem item={item} onPress={handleCardPress} />
  );

  const getItemLayout = (_: any, index: number) => ({
    length: theme.dimensions.carouselCardWidth + theme.spacing.md,
    offset: (theme.dimensions.carouselCardWidth + theme.spacing.md) * index,
    index,
  });

  if (!data.cards || data.cards.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>{data.title}</Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={data.cards}
        renderItem={renderCarouselItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={theme.dimensions.carouselCardWidth + theme.spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        getItemLayout={getItemLayout}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />

      <PaginationDots currentIndex={currentIndex} totalItems={data.cards.length} />
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
  carouselContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  itemSeparator: {
    width: theme.spacing.md,
  },
  carouselItem: {
    width: theme.dimensions.carouselCardWidth,
    height: theme.dimensions.carouselCardHeight,
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: theme.borderRadius.lg,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
    height: '100%',
  },
  tagContainer: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  tagText: {
    ...theme.typography.caption,
    color: theme.colors.surface,
    fontWeight: '600',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.surface,
    marginBottom: theme.spacing.xs,
  },
  cardDescription: {
    ...theme.typography.body,
    color: theme.colors.surface,
    opacity: 0.9,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#24C38E',
  },
  paginationDotInactive: {
    backgroundColor: theme.colors.border,
  },
});