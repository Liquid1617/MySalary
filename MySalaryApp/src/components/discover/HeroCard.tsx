import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { theme } from '../../styles/theme';
import { HeroFocusCard, SectionComponentProps } from '../../types/discover';

interface HeroCardProps extends SectionComponentProps {
  data: HeroFocusCard;
}

export const HeroCard: React.FC<HeroCardProps> = ({ 
  data, 
  onNavigation, 
  onAnalytics 
}) => {
  const handleCtaPress = () => {
    onAnalytics({
      event: 'hero_card_tap',
      properties: {
        focusType: data.categoryId,
        cta: data.ctaText,
        cardId: data.id
      }
    });

    if (data.ctaAction === 'navigation') {
      onNavigation(data.ctaTarget, data.ctaParams);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {data.iconName && (
          <View style={styles.iconContainer}>
            <FontAwesome5 
              name={data.iconName} 
              size={24} 
              color={theme.colors.primary} 
            />
          </View>
        )}
        
        <Text style={styles.title} numberOfLines={2}>
          {data.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={3}>
          {data.description}
        </Text>
        
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={handleCtaPress}
          accessibilityRole="button"
          accessibilityLabel={data.ctaText}
          hitSlop={theme.spacing.sm}
        >
          <Text style={styles.ctaText}>
            {data.ctaText}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    minHeight: theme.dimensions.heroCardMinHeight,
    justifyContent: 'space-between',
    ...theme.shadows.card,
  },
  iconContainer: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  title: {
    ...theme.typography.heroTitle,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.dimensions.primaryButtonRadius,
    height: theme.dimensions.primaryButtonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    ...theme.shadows.button,
  },
  ctaText: {
    ...theme.typography.buttonText,
    color: theme.colors.surface,
  },
});