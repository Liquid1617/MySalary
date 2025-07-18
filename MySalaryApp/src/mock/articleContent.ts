import { ArticleData } from '../components/Article';

export const MASTER_YOUR_MONEY_ARTICLE: ArticleData = {
  id: 'master-your-money-2024',
  title: 'Master Your Money in 2024',
  subtitle: 'A comprehensive guide to achieving financial freedom and building wealth that lasts',
  author: 'Financial Expert',
  publishDate: 'December 2024',
  readTime: 8,
  category: 'Personal Finance',
  tags: ['budgeting', 'investing', 'savings', 'financial planning', 'wealth building'],
  heroVector: '💰',
  gradient: ['#667eea', '#764ba2'],
  sections: [
    {
      id: 'intro',
      type: 'paragraph',
      content: 'Financial freedom isn\'t just a dream—it\'s an achievable goal with the right strategy, discipline, and knowledge. In 2024, with rising inflation and economic uncertainty, mastering your money has become more crucial than ever.',
    },
    {
      id: 'why-now',
      type: 'heading',
      content: 'Why 2024 is the Perfect Time to Start',
    },
    {
      id: 'why-paragraph',
      type: 'paragraph',
      content: 'The current economic landscape presents unique opportunities for those who understand how to navigate it. With new investment platforms, improved financial tools, and changing market dynamics, there has never been a better time to take control of your financial future.',
    },
    {
      id: 'foundation',
      type: 'heading',
      content: 'Building Your Financial Foundation',
    },
    {
      id: 'foundation-quote',
      type: 'quote',
      content: 'A budget is telling your money where to go instead of wondering where it went.',
    },
    {
      id: 'foundation-steps',
      type: 'list',
      content: 'Essential steps to build a solid financial foundation:',
      items: [
        'Track every expense for at least one month to understand your spending patterns',
        'Create a realistic budget using the 50/30/20 rule (needs/wants/savings)',
        'Build an emergency fund covering 3-6 months of expenses',
        'Pay off high-interest debt starting with the highest rates first',
        'Automate your savings to make it effortless and consistent',
      ],
    },
    {
      id: 'investing',
      type: 'heading',
      content: 'Smart Investing for Beginners',
    },
    {
      id: 'investing-paragraph',
      type: 'paragraph',
      content: 'Investing doesn\'t require a finance degree or thousands of dollars to start. With modern investment platforms and index funds, you can begin building wealth with as little as $100. The key is to start early and stay consistent.',
    },
    {
      id: 'investment-chart',
      type: 'image',
      content: 'Investment growth comparison',
      caption: 'The power of compound interest over time',
    },
    {
      id: 'investment-tips',
      type: 'list',
      content: 'Key investment principles for beginners:',
      items: [
        'Start with low-cost index funds for instant diversification',
        'Dollar-cost average by investing the same amount regularly',
        'Don\'t try to time the market—time in market beats timing the market',
        'Rebalance your portfolio annually to maintain target allocation',
        'Focus on long-term growth, not short-term fluctuations',
      ],
    },
    {
      id: 'advanced',
      type: 'heading',
      content: 'Advanced Strategies for Wealth Building',
    },
    {
      id: 'advanced-paragraph',
      type: 'paragraph',
      content: 'Once you\'ve mastered the basics, you can explore more sophisticated strategies to accelerate your wealth building. These include tax-advantaged accounts, real estate investing, and creating multiple income streams.',
    },
    {
      id: 'tax-advantages',
      type: 'paragraph',
      content: 'Maximize your tax-advantaged accounts like 401(k)s, IRAs, and HSAs. These accounts offer immediate tax benefits and can significantly boost your long-term wealth accumulation. If your employer offers a 401(k) match, contribute enough to get the full match—it\'s free money.',
    },
    {
      id: 'conclusion',
      type: 'heading',
      content: 'Your Financial Journey Starts Today',
    },
    {
      id: 'conclusion-paragraph',
      type: 'paragraph',
      content: 'Mastering your money is a marathon, not a sprint. The most important step is the first one. Start where you are, use what you have, and do what you can. With consistency and patience, you\'ll be amazed at what you can achieve.',
    },
  ],
  relatedArticles: [
    {
      id: 'emergency-fund-guide',
      title: 'Emergency Fund 101: How Much Should You Save?',
      description: 'Learn the fundamentals of building an emergency fund and why it\'s crucial for financial stability.',
      readTime: 5,
      category: 'Savings',
      heroVector: '🏦',
    },
    {
      id: 'investment-strategies',
      title: 'Investment Strategies for Different Life Stages',
      description: 'Discover how your investment approach should evolve as you progress through different life stages.',
      readTime: 7,
      category: 'Investing',
      heroVector: '📈',
    },
    {
      id: 'debt-payoff-strategies',
      title: 'Debt Payoff Strategies That Actually Work',
      description: 'Compare different debt payoff methods and find the strategy that works best for your situation.',
      readTime: 6,
      category: 'Debt Management',
      heroVector: '💳',
    },
  ],
};

export const STOCK_ANALYSIS_ARTICLE: ArticleData = {
  id: 'stock-analysis-guide',
  title: 'Stock Analysis Guide',
  subtitle: 'Learn how to analyze stocks like a professional investor',
  author: 'Investment Analyst',
  publishDate: 'November 2024',
  readTime: 12,
  category: 'Investing',
  tags: ['stocks', 'analysis', 'valuation', 'research', 'due diligence'],
  heroVector: '📊',
  gradient: ['#11998e', '#38ef7d'],
  sections: [
    {
      id: 'intro',
      type: 'paragraph',
      content: 'Stock analysis is the cornerstone of successful investing. By learning to evaluate companies properly, you can make informed decisions and potentially achieve superior returns while managing risk.',
    },
    {
      id: 'fundamental-analysis',
      type: 'heading',
      content: 'Fundamental Analysis: The Foundation',
    },
    {
      id: 'fundamental-paragraph',
      type: 'paragraph',
      content: 'Fundamental analysis involves evaluating a company\'s financial health, business model, competitive position, and growth prospects. This approach helps determine the intrinsic value of a stock.',
    },
    {
      id: 'key-metrics',
      type: 'list',
      content: 'Essential financial metrics to analyze:',
      items: [
        'Price-to-Earnings (P/E) ratio for valuation comparison',
        'Debt-to-Equity ratio to assess financial leverage',
        'Return on Equity (ROE) to measure profitability efficiency',
        'Revenue growth rate to gauge business expansion',
        'Free cash flow to understand cash generation ability',
      ],
    },
    {
      id: 'technical-analysis',
      type: 'heading',
      content: 'Technical Analysis: Reading the Charts',
    },
    {
      id: 'technical-paragraph',
      type: 'paragraph',
      content: 'Technical analysis focuses on price movements and trading patterns. While not predictive, it can help with timing entries and exits, especially for shorter-term trades.',
    },
    {
      id: 'warren-buffett-quote',
      type: 'quote',
      content: 'Price is what you pay. Value is what you get.',
    },
    {
      id: 'conclusion',
      type: 'paragraph',
      content: 'Successful stock analysis combines multiple approaches. Use fundamental analysis to identify quality companies, technical analysis for timing, and always consider the broader market context.',
    },
  ],
  relatedArticles: [
    {
      id: 'portfolio-diversification',
      title: 'Portfolio Diversification Strategies',
      description: 'Learn how to build a well-diversified portfolio that can weather market volatility.',
      readTime: 8,
      category: 'Portfolio Management',
      heroVector: '🎯',
    },
    {
      id: 'value-investing',
      title: 'Value Investing: Warren Buffett\'s Approach',
      description: 'Discover the principles of value investing and how to find undervalued companies.',
      readTime: 10,
      category: 'Investment Strategy',
      heroVector: '💎',
    },
  ],
};

export const CRYPTO_MARKET_ARTICLE: ArticleData = {
  id: 'crypto-market-update',
  title: 'Crypto Market Update',
  subtitle: 'Latest cryptocurrency developments and market trends',
  author: 'Crypto Analyst',
  publishDate: 'January 2025',
  readTime: 6,
  category: 'Cryptocurrency',
  tags: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi'],
  heroVector: '₿',
  gradient: ['#f093fb', '#f5576c'],
  sections: [
    {
      id: 'intro',
      type: 'paragraph',
      content: 'The cryptocurrency market continues to evolve rapidly, with new developments in regulation, technology, and adoption. Stay informed about the latest trends shaping the digital asset landscape.',
    },
    {
      id: 'market-trends',
      type: 'heading',
      content: 'Current Market Trends',
    },
    {
      id: 'trends-paragraph',
      type: 'paragraph',
      content: 'Recent market movements have been driven by institutional adoption, regulatory clarity, and technological innovations. Bitcoin and Ethereum continue to dominate, while altcoins show varied performance.',
    },
    {
      id: 'key-developments',
      type: 'list',
      content: 'Key developments to watch:',
      items: [
        'Institutional adoption by major corporations and financial institutions',
        'Regulatory frameworks being established globally',
        'DeFi protocol innovations and yield farming opportunities',
        'NFT market evolution and utility expansion',
        'Central Bank Digital Currencies (CBDCs) development',
      ],
    },
    {
      id: 'investment-considerations',
      type: 'heading',
      content: 'Investment Considerations',
    },
    {
      id: 'considerations-paragraph',
      type: 'paragraph',
      content: 'Cryptocurrency investing requires careful consideration of volatility, regulatory risks, and technological factors. Only invest what you can afford to lose and always do your own research.',
    },
  ],
  relatedArticles: [
    {
      id: 'bitcoin-basics',
      title: 'Bitcoin Basics: Digital Gold Explained',
      description: 'Understanding Bitcoin\'s role as a store of value and digital currency.',
      readTime: 7,
      category: 'Cryptocurrency',
      heroVector: '🏆',
    },
    {
      id: 'defi-guide',
      title: 'DeFi Guide: Decentralized Finance Explained',
      description: 'Learn about decentralized finance protocols and how they\'re changing traditional banking.',
      readTime: 9,
      category: 'DeFi',
      heroVector: '🔗',
    },
  ],
};

export const ARTICLE_CONTENT_MAP: Record<string, ArticleData> = {
  'master-your-money-2024': MASTER_YOUR_MONEY_ARTICLE,
  'financial-education': MASTER_YOUR_MONEY_ARTICLE, // alias
  'stock-analysis-guide': STOCK_ANALYSIS_ARTICLE,
  'crypto-market-update': CRYPTO_MARKET_ARTICLE,
  'crypto-update': CRYPTO_MARKET_ARTICLE, // alias
};

export const getArticleContent = (articleId: string): ArticleData | undefined => {
  return ARTICLE_CONTENT_MAP[articleId];
};

export const getAllArticles = (): ArticleData[] => {
  return Object.values(ARTICLE_CONTENT_MAP);
};