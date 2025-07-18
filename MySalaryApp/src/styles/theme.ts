export const theme = {
  colors: {
    // Primary colors per spec
    primary: '#24C38E',
    danger: '#FF7847',
    surface: '#FFFFFF',
    surfaceAlt: '#F6F7F8',
    textPrimary: '#111',
    textSecondary: '#5A5A5E',
    
    // Additional colors for design system
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    border: '#E5E7EB',
    disabled: '#9CA3AF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    
    // Gradients
    gradients: {
      promo: ['#FFECCB', '#FFD9A9'],
      hero: ['#F0F9FF', '#E0F2FE'],
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  
  typography: {
    heroTitle: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
  },
  
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
    button: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
  },
  
  dimensions: {
    // Touch targets
    minTouchTarget: 44,
    
    // Component sizes
    heroCardMinHeight: 164,
    quickActionWidth: 72,
    quickActionIconSize: 48,
    carouselCardWidth: 280,
    carouselCardHeight: 200,
    toolGridItemHeight: 132,
    hubBannerHeight: 160,
    storyChipSize: 104,
    promoBannerHeight: 120,
    
    // Buttons
    primaryButtonHeight: 36,
    primaryButtonRadius: 10,
  },
} as const;

export type Theme = typeof theme;