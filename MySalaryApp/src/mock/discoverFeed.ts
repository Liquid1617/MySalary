export interface Item {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  tag?: string;
  icon?: string;
  iconType?: 'emoji' | 'fontawesome';
}

export interface Section {
  id: string;
  title: string;
  type: 'list' | 'carousel' | 'featured';
  items: Item[];
  showMore?: boolean;
}

export const MOCK_SECTIONS: Section[] = [
  {
    id: 'financial-tips',
    title: 'Financial Tips',
    type: 'list',
    showMore: true,
    items: [
      {
        id: 'emergency-fund',
        title: 'Emergency Fund Basics',
        icon: '💰',
        iconType: 'emoji',
      },
      {
        id: 'debt-payoff',
        title: 'Debt Payoff Strategies',
        icon: '📈',
        iconType: 'emoji',
      },
      {
        id: 'investment-101',
        title: 'Investment 101',
        icon: '📊',
        iconType: 'emoji',
      },
      {
        id: 'saving-tips',
        title: 'Smart Saving Tips',
        icon: '🏦',
        iconType: 'emoji',
      },
    ],
  },
  {
    id: 'market-insights',
    title: 'Market Insights',
    type: 'carousel',
    showMore: true,
    items: [
      {
        id: 'market-trends',
        title: 'Market Trends 2024',
        description: 'Understanding current market movements',
        imageUrl: 'https://picsum.photos/300/200?random=1',
        tag: 'Trending',
      },
      {
        id: 'stock-analysis',
        title: 'Stock Analysis Guide',
        description: 'How to analyze stocks like a pro',
        imageUrl: 'https://picsum.photos/300/200?random=2',
        tag: 'Popular',
      },
      {
        id: 'crypto-update',
        title: 'Crypto Market Update',
        description: 'Latest cryptocurrency developments',
        imageUrl: 'https://picsum.photos/300/200?random=3',
        tag: 'New',
      },
      {
        id: 'economy-outlook',
        title: 'Economic Outlook',
        description: 'Global economic predictions',
        imageUrl: 'https://picsum.photos/300/200?random=4',
      },
    ],
  },
  {
    id: 'budgeting-tools',
    title: 'Budgeting Tools',
    type: 'list',
    showMore: true,
    items: [
      {
        id: 'budget-calculator',
        title: 'Budget Calculator',
        icon: 'calculator',
        iconType: 'fontawesome',
      },
      {
        id: 'expense-tracker',
        title: 'Expense Tracker',
        icon: 'chart-line',
        iconType: 'fontawesome',
      },
      {
        id: 'savings-goals',
        title: 'Savings Goals',
        icon: 'bullseye',
        iconType: 'fontawesome',
      },
      {
        id: 'debt-manager',
        title: 'Debt Manager',
        icon: 'credit-card',
        iconType: 'fontawesome',
      },
    ],
  },
  {
    id: 'featured-content',
    title: 'Featured Content',
    type: 'featured',
    items: [
      {
        id: 'financial-education',
        title: 'Master Your Money in 2024',
        description: 'Complete guide to financial freedom',
        imageUrl: 'https://picsum.photos/400/200?random=5',
      },
    ],
  },
  {
    id: 'investment-strategies',
    title: 'Investment Strategies',
    type: 'carousel',
    showMore: true,
    items: [
      {
        id: 'value-investing',
        title: 'Value Investing',
        description: 'Long-term investment strategy',
        imageUrl: 'https://picsum.photos/300/200?random=6',
        tag: 'Recommended',
      },
      {
        id: 'dividend-stocks',
        title: 'Dividend Investing',
        description: 'Generate passive income',
        imageUrl: 'https://picsum.photos/300/200?random=7',
      },
      {
        id: 'etf-guide',
        title: 'ETF Investment Guide',
        description: 'Diversified portfolio building',
        imageUrl: 'https://picsum.photos/300/200?random=8',
        tag: 'Beginner',
      },
      {
        id: 'real-estate',
        title: 'Real Estate Investment',
        description: 'Property investment basics',
        imageUrl: 'https://picsum.photos/300/200?random=9',
      },
    ],
  },
];
