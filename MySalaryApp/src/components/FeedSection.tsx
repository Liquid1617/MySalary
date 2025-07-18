import React from 'react';
import { View, StyleSheet } from 'react-native';
import SectionHeading from './SectionHeading';
import MinimalListItem from './MinimalListItem';
import CardCarousel from './CardCarousel';
import FeaturedCard from './FeaturedCard';
import { Section, Item } from '../mock/discoverFeed';

interface FeedSectionProps {
  section: Section;
  onItemPress?: (item: Item) => void;
  onShowMore?: (section: Section) => void;
}

const FeedSection: React.FC<FeedSectionProps> = ({
  section,
  onItemPress,
  onShowMore,
}) => {
  const handleShowMore = () => {
    onShowMore?.(section);
  };

  const renderContent = () => {
    switch (section.type) {
      case 'list':
        return (
          <View style={styles.listContainer}>
            {section.items.map(item => (
              <MinimalListItem
                key={item.id}
                id={item.id}
                title={item.title}
                icon={item.icon}
                iconType={item.iconType}
                onPress={onItemPress}
              />
            ))}
          </View>
        );

      case 'carousel':
        return (
          <CardCarousel
            items={section.items}
            onItemPress={onItemPress}
            cardWidth={200}
          />
        );

      case 'featured':
        const featuredItem = section.items[0];
        if (!featuredItem) return null;

        return (
          <FeaturedCard
            id={featuredItem.id}
            title={featuredItem.title}
            description={featuredItem.description}
            imageUrl={featuredItem.imageUrl}
            onPress={() => onItemPress?.(featuredItem)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <SectionHeading
        title={section.title}
        onShowMore={section.showMore ? handleShowMore : undefined}
      />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  listContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});

export default FeedSection;
