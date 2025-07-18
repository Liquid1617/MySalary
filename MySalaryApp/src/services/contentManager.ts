import { CarouselContent, CarouselCard } from '../mock/carouselContent';

export interface ContentTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  cards: CarouselCard[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentFilter {
  category?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isActive?: boolean;
}

export class ContentManager {
  private static instance: ContentManager;
  private contentCache: Map<string, ContentTemplate> = new Map();
  private apiEndpoint: string = 'https://your-api.com/content'; // Replace with your API

  static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager();
    }
    return ContentManager.instance;
  }

  // Load content from API or local storage
  async loadContent(contentId: string): Promise<CarouselContent | null> {
    try {
      // Try cache first
      const cached = this.contentCache.get(contentId);
      if (cached && cached.isActive) {
        return this.templateToCarouselContent(cached);
      }

      // Load from API
      const response = await fetch(`${this.apiEndpoint}/${contentId}`);
      if (!response.ok) {
        throw new Error(`Failed to load content: ${response.status}`);
      }

      const template: ContentTemplate = await response.json();
      this.contentCache.set(contentId, template);
      
      return this.templateToCarouselContent(template);
    } catch (error) {
      console.error('Content loading error:', error);
      return this.getFallbackContent(contentId);
    }
  }

  // Get all available content
  async getAllContent(filter?: ContentFilter): Promise<ContentTemplate[]> {
    try {
      const response = await fetch(`${this.apiEndpoint}?${this.buildQueryString(filter)}`);
      const content: ContentTemplate[] = await response.json();
      
      // Update cache
      content.forEach(template => {
        this.contentCache.set(template.id, template);
      });
      
      return content;
    } catch (error) {
      console.error('Failed to load all content:', error);
      return [];
    }
  }

  // Create new content
  async createContent(template: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentTemplate> {
    const newTemplate: ContentTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });

      if (!response.ok) {
        throw new Error(`Failed to create content: ${response.status}`);
      }

      const created: ContentTemplate = await response.json();
      this.contentCache.set(created.id, created);
      
      return created;
    } catch (error) {
      console.error('Content creation error:', error);
      throw error;
    }
  }

  // Update existing content
  async updateContent(contentId: string, updates: Partial<ContentTemplate>): Promise<ContentTemplate> {
    try {
      const updatedTemplate = {
        ...updates,
        id: contentId,
        updatedAt: new Date(),
      };

      const response = await fetch(`${this.apiEndpoint}/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTemplate),
      });

      if (!response.ok) {
        throw new Error(`Failed to update content: ${response.status}`);
      }

      const updated: ContentTemplate = await response.json();
      this.contentCache.set(contentId, updated);
      
      return updated;
    } catch (error) {
      console.error('Content update error:', error);
      throw error;
    }
  }

  // Delete content
  async deleteContent(contentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiEndpoint}/${contentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete content: ${response.status}`);
      }

      this.contentCache.delete(contentId);
      return true;
    } catch (error) {
      console.error('Content deletion error:', error);
      return false;
    }
  }

  // Content templates for quick creation
  getQuestionTemplate(): Partial<CarouselCard> {
    return {
      type: 'question',
      title: '',
      content: '',
      question: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
      ],
      correctAnswer: 'A',
      explanation: '',
      gradient: ['#E8F4FD', '#B3E5FC'],
      illustration: '🤔',
      relatedContent: [],
    };
  }

  getInfoTemplate(): Partial<CarouselCard> {
    return {
      type: 'info',
      title: '',
      content: '',
      gradient: ['#F3E5F5', '#E1BEE7'],
    };
  }

  // Helper methods
  private templateToCarouselContent(template: ContentTemplate): CarouselContent {
    return {
      id: template.id,
      title: template.title,
      description: template.description,
      cards: template.cards,
    };
  }

  private getFallbackContent(contentId: string): CarouselContent | null {
    // Return static fallback content if API fails
    const fallbacks: Record<string, CarouselContent> = {
      'market-trends': {
        id: 'market-trends',
        title: 'Market Trends',
        description: 'Basic market information',
        cards: [
          {
            id: 'fallback-1',
            type: 'info',
            title: 'Content Loading Error',
            content: 'Unable to load the latest content. Please try again later.',
            gradient: ['#FFE0E0', '#FFC0C0'],
          },
        ],
      },
    };

    return fallbacks[contentId] || null;
  }

  private buildQueryString(filter?: ContentFilter): string {
    if (!filter) return '';
    
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, String(value));
        }
      }
    });
    
    return params.toString();
  }

  private generateId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const contentManager = ContentManager.getInstance();