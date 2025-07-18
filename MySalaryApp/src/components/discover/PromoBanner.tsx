import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { theme } from '../../styles/theme';
import { FeaturedPromo, SectionComponentProps } from '../../types/discover';

interface PromoBannerProps extends SectionComponentProps {
  data: FeaturedPromo;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ data, onNavigation, onAnalytics }) => {
  const handlePromoPress = () => {
    onAnalytics({
      event: 'featured_promo_tap',
      properties: {
        promoId: data.id,
        promoTitle: data.title,
        ctaText: data.ctaText,
      },
    });

    if (data.action === 'navigation') {
      onNavigation(data.target, data.params);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressablePressed,
        ]}
        onPress={handlePromoPress}
        accessibilityRole="button"
        accessibilityLabel={`${data.title} - ${data.ctaText}`}
      >
        <LinearGradient
          colors={data.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoBanner}
        >
          <View style={styles.promoContent}>
            <View style={styles.promoTextContainer}>
              <Text style={styles.promoTitle} numberOfLines={2}>
                {data.title}
              </Text>
              <Text style={styles.promoDescription} numberOfLines={3}>
                {data.description}
              </Text>
            </View>
            
            <View style={styles.promoCtaContainer}>
              <View style={styles.promoCtaButton}>
                <Text style={styles.promoCtaText}>
                  {data.ctaText}
                </Text>
                <FontAwesome5 
                  name="arrow-right" 
                  size={14} 
                  color={theme.colors.surface}
                  style={styles.promoCtaIcon}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  pressable: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  pressablePressed: {
    opacity: 0.8,
  },
  promoBanner: {
    height: theme.dimensions.promoBannerHeight,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  promoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoTextContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  promoTitle: {
    ...theme.typography.cardTitle,
    color: theme.colors.textPrimary,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  promoDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  promoCtaContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  promoCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.button,
  },
  promoCtaText: {
    ...theme.typography.buttonText,
    color: theme.colors.surface,
    marginRight: theme.spacing.sm,
  },
  promoCtaIcon: {
    marginLeft: theme.spacing.xs,
  },
});