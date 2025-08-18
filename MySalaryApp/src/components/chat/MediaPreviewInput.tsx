import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MediaFile } from '../../utils/imagePickerUtils';

interface MediaPreviewInputProps {
  mediaFiles: MediaFile[];
  onRemove: (index: number) => void;
}

export const MediaPreviewInput: React.FC<MediaPreviewInputProps> = ({ 
  mediaFiles, 
  onRemove 
}) => {
  if (!mediaFiles || mediaFiles.length === 0) {
    return null;
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      {mediaFiles.map((file, index) => (
        <View key={index} style={styles.mediaItem}>
          {file.type.startsWith('image') ? (
            <Image 
              source={{ uri: file.uri }} 
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Text style={styles.videoIcon}>🎥</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => onRemove(index)}
            hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
          >
            <Text style={styles.removeIcon}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  mediaItem: {
    width: 38,
    height: 38,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F5F5F5',
    marginRight: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
  },
  videoIcon: {
    fontSize: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  removeIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 12,
  },
});