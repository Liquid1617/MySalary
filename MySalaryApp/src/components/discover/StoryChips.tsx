import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Linking } from 'react-native';
import { theme } from '../../styles/theme';
import { CommunityStories, CommunityStory, SectionComponentProps } from '../../types/discover';

interface StoryChipsProps extends SectionComponentProps {
  data: CommunityStories;
}

interface StoryChipProps {
  story: CommunityStory;
  onPress: (story: CommunityStory) => void;
}

const StoryChip: React.FC<StoryChipProps> = ({ story, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.storyChip}
      onPress={() => onPress(story)}
      accessibilityRole="button"
      accessibilityLabel={`${story.title} story by ${story.author}`}
    >
      <View style={styles.storyThumbnailContainer}>
        <Image 
          source={{ uri: story.thumbnailUrl }} 
          style={styles.storyThumbnail}
          resizeMode="cover"
        />
        <View style={styles.storyBorder} />
      </View>
      
      <View style={styles.storyInfo}>
        <Text style={styles.storyTitle} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={styles.storyAuthor} numberOfLines={1}>
          {story.author}
        </Text>
        <View style={styles.storyMeta}>
          <Text style={styles.storyDuration}>
            {Math.floor(story.duration / 60)}:{(story.duration % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const StoryChips: React.FC<StoryChipsProps> = ({ data, onNavigation, onAnalytics }) => {
  const handleStoryPress = async (story: CommunityStory) => {
    onAnalytics({
      event: 'community_story_tap',
      properties: {
        storyId: story.id,
        storyTitle: story.title,
        author: story.author,
        category: story.category,
        duration: story.duration,
      },
    });

    // TODO: Integrate with react-native-stories-view when available
    // For now, open the story URL in browser
    try {
      const supported = await Linking.canOpenURL(story.storyUrl);
      if (supported) {
        await Linking.openURL(story.storyUrl);
      } else {
        console.warn('Cannot open story URL:', story.storyUrl);
      }
    } catch (error) {
      console.error('Error opening story URL:', error);
    }
  };

  const renderStoryChip = ({ item }: { item: CommunityStory }) => (
    <StoryChip story={item} onPress={handleStoryPress} />
  );

  if (!data.stories || data.stories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.sectionTitle}>{data.title}</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No community stories available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.sectionTitle}>{data.title}</Text>
      </View>
      
      <FlatList
        data={data.stories}
        renderItem={renderStoryChip}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
        ItemSeparatorComponent={() => <View style={styles.storySeparator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  titleContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.sectionTitle,
    color: theme.colors.textPrimary,
  },
  storiesContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  storySeparator: {
    width: theme.spacing.md,
  },
  storyChip: {
    alignItems: 'center',
    width: 120,
  },
  storyThumbnailContainer: {
    position: 'relative',
    marginBottom: theme.spacing.sm,
  },
  storyThumbnail: {
    width: theme.dimensions.storyChipSize,
    height: theme.dimensions.storyChipSize,
    borderRadius: theme.dimensions.storyChipSize / 2,
  },
  storyBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: (theme.dimensions.storyChipSize + 4) / 2,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  storyInfo: {
    alignItems: 'center',
    width: '100%',
  },
  storyTitle: {
    ...theme.typography.caption,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  storyAuthor: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  storyMeta: {
    alignItems: 'center',
  },
  storyDuration: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
  },
  emptyStateText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});