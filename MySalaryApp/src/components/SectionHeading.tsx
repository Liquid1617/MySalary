import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { typographyStyles, colors } from '../styles';

interface SectionHeadingProps {
  title: string;
  showMoreText?: string;
  onShowMore?: () => void;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  showMoreText = 'Show more',
  onShowMore,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[typographyStyles.h3, styles.title]}>{title}</Text>

      {onShowMore && (
        <TouchableOpacity
          style={styles.showMoreButton}
          onPress={onShowMore}
          activeOpacity={0.8}>
          <Text style={[typographyStyles.body2, styles.showMoreText]}>
            {showMoreText}
          </Text>
          <FontAwesome5
            name="chevron-right"
            size={16}
            color={colors.textSecondary}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.black,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  chevronIcon: {
    marginLeft: 4,
  },
});

export default SectionHeading;
