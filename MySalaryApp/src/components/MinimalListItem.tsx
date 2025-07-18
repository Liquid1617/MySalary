import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { colors, typographyStyles } from '../styles';
import { Item } from '../mock/discoverFeed';

interface MinimalListItemProps {
  id: string;
  title: string;
  icon?: string;
  iconType?: 'emoji' | 'fontawesome';
  onPress?: (item: Item) => void;
}

const MinimalListItem: React.FC<MinimalListItemProps> = ({
  id,
  title,
  icon,
  iconType = 'emoji',
  onPress,
}) => {
  const handlePress = () => {
    onPress?.({ id, title, icon, iconType });
  };

  const renderIcon = () => {
    if (!icon) return null;

    if (iconType === 'emoji') {
      return <Text style={styles.emojiIcon}>{icon}</Text>;
    }

    return (
      <FontAwesome5
        name={icon}
        size={20}
        color={colors.textSecondary}
        style={styles.fontAwesomeIcon}
      />
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}>
      <View style={styles.leftSection}>
        {renderIcon()}
        <Text style={[typographyStyles.body1, styles.title]}>{title}</Text>
      </View>

      <FontAwesome5
        name="chevron-right"
        size={16}
        color={colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  fontAwesomeIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
});

export default MinimalListItem;
