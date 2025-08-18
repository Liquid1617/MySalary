import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { MediaFile } from '../../utils/imagePickerUtils';

interface MediaPreviewProps {
  mediaFiles: MediaFile[];
  maxItems?: number;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  mediaFiles,
  maxItems = 4,
}) => {
  if (!mediaFiles || mediaFiles.length === 0) {
    return null;
  }

  // Определяем количество изображений в зависимости от общего количества
  const imageCount = Math.min(mediaFiles.length, maxItems);
  const visibleFiles = mediaFiles.slice(0, maxItems);
  const remainingCount = mediaFiles.length - maxItems;

  // Определяем размер изображений в зависимости от количества
  const getImageSize = (count: number) => {
    if (count === 1) return 85;
    if (count === 2) return 60;
    return 45; // для 3-4 изображений
  };

  const imageSize = getImageSize(imageCount);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {visibleFiles.map((file, index) => (
          <View
            key={index}
            style={[styles.mediaItem, { width: imageSize, height: imageSize }]}>
            {file.type.startsWith('image') ? (
              <Image
                source={{ uri: file.uri }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.videoPlaceholder}>
                <Text style={styles.videoIcon}>🎥</Text>
                <Text style={styles.videoText}>Видео</Text>
              </View>
            )}
            {remainingCount > 0 && index === maxItems - 1 && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>+{remainingCount}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    maxWidth: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    alignSelf: 'flex-start',
  },
  mediaItem: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  videoText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Commissioner',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Commissioner',
  },
});
