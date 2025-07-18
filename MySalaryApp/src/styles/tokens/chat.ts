// Design tokens for AI Chat
export const chatTokens = {
  colors: {
    primary: '#0066FF',
    surface: '#FFFFFF',
    backgroundSubtle: '#F8FAFD',
    error: '#E53935',
    textPrimary: '#111111',
    textSecondary: '#666666',
    
    // Message bubbles
    aiBubble: '#F1F2F6',
    userBubble: '#0066FF',
    aiText: '#111111',
    userText: '#FFFFFF',
    
    // Gradient background
    gradientStart: '#ECF2FF',
    gradientEnd: '#F8FAFD',
    
    // Dividers and borders
    divider: '#E0E0E0',
    border: '#E0E0E0',
    
    // States
    streaming: '#0066FF',
    errorBubble: '#FFEFEF',
    disabled: '#CCCCCC',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 24,
    bubble: 20,
  },
  
  typography: {
    header: {
      fontSize: 17,
      fontWeight: '600' as const,
      lineHeight: 22,
    },
    messageText: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    dateText: {
      fontSize: 11,
      fontWeight: '400' as const,
      lineHeight: 14,
    },
    placeholderText: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
  },
  
  dimensions: {
    headerHeight: 56,
    inputMinHeight: 48,
    inputMaxHeight: 120,
    avatarSize: 32,
    fabSize: 40,
    buttonSize: 32,
    attachButtonSize: 28,
    
    // Touch targets
    minTouchTarget: 48,
    
    // Message bubbles
    bubbleMaxWidth: 0.76, // 76% of screen width
    bubblePadding: {
      horizontal: 16,
      vertical: 12,
    },
    
    // Spacing
    messageGroupSpacing: 12,
    messageInGroupSpacing: 4,
  },
  
  shadows: {
    header: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    fab: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 4,
    },
  },
  
  animations: {
    typewriterSpeed: 50, // characters per second
    shakeAnimation: {
      duration: 36, // 2 x 18ms
      amplitude: 4,
    },
    fadeIn: {
      duration: 200,
    },
    slideIn: {
      duration: 300,
    },
  },
  
  accessibility: {
    contrastRatio: 4.5,
    minTouchTarget: 48,
  },
} as const;

export type ChatTokens = typeof chatTokens;