import { CarouselCard } from '../components/ContentCarousel';

export interface CarouselContent {
  id: string;
  title: string;
  description: string;
  cards: CarouselCard[];
}

export const MARKET_TRENDS_CONTENT: CarouselContent = {
  id: 'market-trends',
  title: 'Market Trends',
  description: 'Understanding current market movements and financial insights',
  cards: [
    {
      id: 'coffee-fast-question',
      type: 'question',
      title: 'Intermittent Fasting & Coffee',
      content: 'Learn about the effects of coffee on intermittent fasting',
      question: 'WILL COFFEE BREAK MY FAST?',
      options: [
        { id: 'A', text: 'Yes' },
        { id: 'B', text: 'No' },
      ],
      correctAnswer: 'B',
      explanation: 'Black coffee without any additives typically won\'t break your fast. Coffee contains minimal calories and can actually support your fasting goals by suppressing appetite and boosting metabolism.',
      gradient: ['#E8F4FD', '#B3E5FC'],
      illustration: '☕',
      relatedContent: [
        {
          id: 'coffee-milk-fast',
          title: 'Will coffee with milk break my fast?',
          description: 'Learn about different coffee additions and fasting'
        },
        {
          id: 'bulletproof-coffee',
          title: 'Will Bulletproof Coffee Break My Fast?',
          description: 'Understanding fats and ketosis during fasting'
        }
      ]
    },
    {
      id: 'market-volatility',
      type: 'info',
      title: 'Market Volatility',
      content: 'Market volatility refers to the degree of variation in trading prices over time. Understanding volatility helps investors make informed decisions about risk and potential returns.',
      gradient: ['#F3E5F5', '#E1BEE7'],
    },
    {
      id: 'investment-timing',
      type: 'question',
      title: 'Investment Timing',
      content: 'When is the best time to invest in the market?',
      question: 'WHEN IS THE BEST TIME TO INVEST?',
      options: [
        { id: 'A', text: 'Only during market lows' },
        { id: 'B', text: 'Time in market beats timing the market' },
      ],
      correctAnswer: 'B',
      explanation: 'Research consistently shows that time in the market is more important than timing the market. Regular, consistent investing (dollar-cost averaging) typically outperforms trying to time market peaks and valleys.',
      gradient: ['#E8F5E8', '#C8E6C9'],
      illustration: '📈',
      relatedContent: [
        {
          id: 'dollar-cost-averaging',
          title: 'Dollar-Cost Averaging Strategy',
          description: 'Learn about systematic investment approach'
        },
        {
          id: 'market-timing-myths',
          title: 'Market Timing Myths',
          description: 'Common misconceptions about market timing'
        }
      ]
    },
    {
      id: 'diversification',
      type: 'info',
      title: 'Portfolio Diversification',
      content: 'Diversification is the practice of spreading investments across various financial instruments, industries, and other categories to reduce risk. It\'s often summarized as "don\'t put all your eggs in one basket."',
      gradient: ['#FFF3E0', '#FFE0B2'],
    },
    {
      id: 'emergency-fund',
      type: 'question',
      title: 'Emergency Fund',
      content: 'How much should you save for emergencies?',
      question: 'HOW MUCH SHOULD I SAVE FOR EMERGENCIES?',
      options: [
        { id: 'A', text: '1-2 months of expenses' },
        { id: 'B', text: '3-6 months of expenses' },
        { id: 'C', text: '1 year of expenses' },
      ],
      correctAnswer: 'B',
      explanation: 'Financial experts generally recommend saving 3-6 months of living expenses in an emergency fund. This provides a buffer for unexpected events like job loss, medical emergencies, or major repairs.',
      gradient: ['#E3F2FD', '#BBDEFB'],
      illustration: '🏦',
      relatedContent: [
        {
          id: 'emergency-fund-tips',
          title: 'Building Your Emergency Fund',
          description: 'Step-by-step guide to building emergency savings'
        },
        {
          id: 'where-to-keep-emergency-fund',
          title: 'Where to Keep Emergency Money',
          description: 'Best accounts for emergency fund storage'
        }
      ]
    }
  ]
};

export const INVESTMENT_STRATEGIES_CONTENT: CarouselContent = {
  id: 'investment-strategies',
  title: 'Investment Strategies',
  description: 'Learn about different investment approaches and strategies',
  cards: [
    {
      id: 'value-vs-growth',
      type: 'question',
      title: 'Value vs Growth Investing',
      content: 'Understanding different investment philosophies',
      question: 'WHAT\'S THE DIFFERENCE BETWEEN VALUE AND GROWTH INVESTING?',
      options: [
        { id: 'A', text: 'Value focuses on undervalued stocks, Growth on high-potential companies' },
        { id: 'B', text: 'They are the same thing' },
      ],
      correctAnswer: 'A',
      explanation: 'Value investing focuses on buying undervalued stocks trading below their intrinsic value, while growth investing targets companies with high growth potential, even if they seem expensive currently.',
      gradient: ['#F1F8E9', '#DCEDC8'],
      illustration: '📊',
      relatedContent: [
        {
          id: 'value-investing-basics',
          title: 'Value Investing Fundamentals',
          description: 'Learn Warren Buffett\'s investment approach'
        },
        {
          id: 'growth-stock-analysis',
          title: 'Analyzing Growth Stocks',
          description: 'How to evaluate high-growth companies'
        }
      ]
    },
    {
      id: 'index-funds',
      type: 'info',
      title: 'Index Fund Investing',
      content: 'Index funds are a type of mutual fund or ETF designed to track a specific market index. They offer instant diversification and typically have lower fees than actively managed funds.',
      gradient: ['#E8EAF6', '#C5CAE9'],
    }
  ]
};

export const CAROUSEL_CONTENT_MAP: Record<string, CarouselContent> = {
  'market-trends': MARKET_TRENDS_CONTENT,
  'investment-strategies': INVESTMENT_STRATEGIES_CONTENT,
  // Add more content as needed
};

export const getCarouselContent = (contentId: string): CarouselContent | undefined => {
  return CAROUSEL_CONTENT_MAP[contentId];
};