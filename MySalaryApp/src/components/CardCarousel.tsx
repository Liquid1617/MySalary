import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import Card from './Card';
import { Item } from '../mock/discoverFeed';

interface CardCarouselProps {
  items: Item[];
  onItemPress?: (item: Item) => void;
  cardWidth?: number;
}

const CardCarousel: React.FC<CardCarouselProps> = ({
  items,
  onItemPress,
  cardWidth = 200,
}) => {
  const renderItem = ({ item }: { item: Item }) => (
    <Card
      id={item.id}
      title={item.title}
      imageUrl={item.imageUrl}
      tag={item.tag}
      description={item.description}
      width={cardWidth}
      onPress={() => onItemPress?.(item)}
    />
  );

  const renderSeparator = () => <View style={styles.separator} />;

  const getItemLayout = (_: any, index: number) => ({
    length: cardWidth + 16, // card width + separator width
    offset: (cardWidth + 16) * index,
    index,
  });

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={cardWidth + 16}
      contentContainerStyle={styles.contentContainer}
      ItemSeparatorComponent={renderSeparator}
      getItemLayout={getItemLayout}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 24,
  },
  separator: {
    width: 16,
  },
});

export default CardCarousel;
