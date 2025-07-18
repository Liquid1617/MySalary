// Discover Screen Type Definitions

export interface HeroFocusCard {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  ctaAction: 'navigation' | 'modal';
  ctaTarget: string;
  ctaParams?: Record<string, any>;
  iconName?: string;
  categoryId?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  iconName: string;
  iconType: 'fontawesome' | 'emoji';
  action: 'navigation' | 'modal';
  target: string;
  params?: Record<string, any>;
  usageCount: number;
}

export interface CarouselCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tag?: string;
  action: 'navigation' | 'modal';
  target: string;
  params?: Record<string, any>;
}

export interface LearnAndDoCarousel {
  id: string;
  title: string;
  cards: CarouselCard[];
  autoplay: boolean;
  autoplayInterval?: number;
}

export interface PersonalRecommendation {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
  category: string;
  priority: number;
}

export interface PersonalRecoList {
  id: string;
  title: string;
  recommendations: PersonalRecommendation[];
  mlReady: boolean;
  placeholderCount: number;
}

export interface FinancialTool {
  id: string;
  title: string;
  iconName: string;
  iconType: 'fontawesome' | 'emoji';
  description: string;
  action: 'navigation' | 'modal';
  target: string;
  params?: Record<string, any>;
}

export interface ToolsGrid {
  id: string;
  title: string;
  tools: FinancialTool[];
  numColumns: number;
}

export interface TopicHub {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  action: 'navigation' | 'modal';
  target: string;
  params?: Record<string, any>;
}

export interface TopicHubs {
  id: string;
  title: string;
  hubs: TopicHub[];
}

export interface CommunityStory {
  id: string;
  title: string;
  thumbnailUrl: string;
  storyUrl: string;
  duration: number;
  author: string;
  category: string;
}

export interface CommunityStories {
  id: string;
  title: string;
  stories: CommunityStory[];
}

export interface FeaturedPromo {
  id: string;
  title: string;
  description: string;
  ctaText: string;
  action: 'navigation' | 'modal';
  target: string;
  params?: Record<string, any>;
  gradientColors: string[];
}

export type SectionType = 
  | 'HeroFocusCard'
  | 'QuickActionsRow'
  | 'LearnAndDoCarousel'
  | 'PersonalRecoList'
  | 'ToolsGrid'
  | 'TopicHubs'
  | 'CommunityStories'
  | 'FeaturedPromo'
  | 'BottomSafePad';

export interface DiscoverSection {
  id: string;
  type: SectionType;
  key: string;
  data: any;
  sticky?: boolean;
  order: number;
}

export interface DiscoverScreenData {
  sections: DiscoverSection[];
  lastUpdated: string;
  version: string;
}

// Navigation types
export interface NavigationParams {
  LimitCreation: { categoryId?: string };
  ExpenseForm: undefined;
  DynamicRoute: { id: string };
  ToolRoot: { toolId: string };
  PaywallPro: undefined;
}

// Analytics events
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

// Zustand store types
export interface DiscoverStore {
  // State
  sections: DiscoverSection[];
  refreshing: boolean;
  quickActions: QuickAction[];
  mlReady: boolean;
  
  // Actions
  setSections: (sections: DiscoverSection[]) => void;
  setRefreshing: (refreshing: boolean) => void;
  incrementUsageCount: (actionId: string) => void;
  refresh: () => Promise<void>;
  loadInitialData: () => Promise<void>;
}

// Component props types
export interface SectionComponentProps {
  data: any;
  onNavigation: (target: string, params?: Record<string, any>) => void;
  onAnalytics: (event: AnalyticsEvent) => void;
}