import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, typographyStyles } from '../styles';

interface FeaturedCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  backgroundColor?: string;
  onPress?: () => void;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({
  title,
  description,
  imageUrl,
  backgroundColor = colors.primary,
  onPress,
}) => {
  const renderContent = () => (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.6)']}
        style={styles.gradient}>
        <View style={styles.content}>
          <Text style={[typographyStyles.h4, styles.title]}>{title}</Text>
          {description && (
            <Text style={[typographyStyles.body2, styles.description]}>
              {description}
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}>
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}>
          {renderContent()}
        </ImageBackground>
      ) : (
        <View style={[styles.colorBackground, { backgroundColor }]}>
          <View style={styles.content}>
            <Text style={[typographyStyles.h4, styles.title]}>{title}</Text>
            {description && (
              <Text style={[typographyStyles.body2, styles.description]}>
                {description}
              </Text>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageBackground: {
    flex: 1,
  },
  imageStyle: {
    borderRadius: 16,
  },
  colorBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});

export default FeaturedCard;
