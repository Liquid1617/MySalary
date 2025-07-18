import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors, typographyStyles } from '../styles';

interface CardProps {
  id: string;
  title: string;
  imageUrl?: string;
  tag?: string;
  description?: string;
  onPress?: () => void;
  width?: number;
}

const Card: React.FC<CardProps> = ({
  title,
  imageUrl,
  tag,
  description,
  onPress,
  width = 200,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            onError={() => {
              // Handle image loading error gracefully
            }}
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}

        {tag && (
          <View style={styles.tagContainer}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={[typographyStyles.body1, styles.title]} numberOfLines={2}>
          {title}
        </Text>

        {description && (
          <Text
            style={[typographyStyles.body2, styles.description]}
            numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.lightGray,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tagContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default Card;
