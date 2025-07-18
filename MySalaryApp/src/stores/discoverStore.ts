import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  DiscoverSection, 
  QuickAction, 
  DiscoverStore 
} from '../types/discover';
import discoverData from '../../assets/discover.json';

// Load static data
const loadDiscoverData = async (): Promise<DiscoverSection[]> => {
  try {
    // In a real app, this would be an API call
    return discoverData.sections as DiscoverSection[];
  } catch (error) {
    console.error('Failed to load discover data:', error);
    return [];
  }
};

// Extract quick actions from discover data
const extractQuickActions = (sections: DiscoverSection[]): QuickAction[] => {
  const quickActionsSection = sections.find(s => s.type === 'QuickActionsRow');
  if (!quickActionsSection) return [];
  
  return quickActionsSection.data.actions || [];
};

export const useDiscoverStore = create<DiscoverStore>()(
  persist(
    (set, get) => ({
      // State
      sections: [],
      refreshing: false,
      quickActions: [],
      mlReady: false,
      
      // Actions
      setSections: (sections: DiscoverSection[]) => {
        const quickActions = extractQuickActions(sections);
        set({ 
          sections,
          quickActions: quickActions.sort((a, b) => b.usageCount - a.usageCount)
        });
      },
      
      setRefreshing: (refreshing: boolean) => {
        set({ refreshing });
      },
      
      incrementUsageCount: (actionId: string) => {
        const { quickActions } = get();
        const updatedActions = quickActions.map(action => 
          action.id === actionId 
            ? { ...action, usageCount: action.usageCount + 1 }
            : action
        );
        
        // Re-sort by usage count
        const sortedActions = updatedActions.sort((a, b) => b.usageCount - a.usageCount);
        
        set({ quickActions: sortedActions });
      },
      
      refresh: async () => {
        set({ refreshing: true });
        
        try {
          // Simulate API delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const sections = await loadDiscoverData();
          get().setSections(sections);
          
          // TODO-ML-PERSONAL_RECO
          // When ML service is ready, fetch personalized recommendations
          // const personalizedRecos = await fetchPersonalizedRecommendations();
          // updatePersonalizedRecommendations(personalizedRecos);
          
        } catch (error) {
          console.error('Failed to refresh discover data:', error);
        } finally {
          set({ refreshing: false });
        }
      },
      
      loadInitialData: async () => {
        try {
          const sections = await loadDiscoverData();
          get().setSections(sections);
        } catch (error) {
          console.error('Failed to load initial discover data:', error);
        }
      },
    }),
    {
      name: 'discover-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist usage counts, not the entire state
      partialize: (state) => ({
        quickActions: state.quickActions.map(action => ({
          ...action,
          usageCount: action.usageCount
        }))
      }),
    }
  )
);