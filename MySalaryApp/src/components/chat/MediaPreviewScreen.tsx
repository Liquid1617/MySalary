import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  FlatList,
  Image,
  TextInput,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
  KeyboardAvoidingView,
} from 'react-native';
import { openCamera, MediaFile } from '../../utils/imagePickerUtils';

interface MediaPreviewScreenProps {
  visible: boolean;
  onClose: () => void;
  onSend: (text: string, mediaFiles: MediaFile[]) => void;
}

interface GalleryAsset {
  uri: string;
  type: 'photo' | 'video';
  fileName?: string;
  timestamp?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const itemSize = (screenWidth - 48) / 3; // 3 columns with margins

export const MediaPreviewScreen: React.FC<MediaPreviewScreenProps> = ({
  visible,
  onClose,
  onSend,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [galleryAssets, setGalleryAssets] = useState<GalleryAsset[]>([]);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (visible) {
      loadGalleryAssets();
    }
  }, [visible]);

  const loadGalleryAssets = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage permission denied');
          return;
        }
      }

      // Mock gallery data - replace with actual gallery implementation
      const mockAssets: GalleryAsset[] = Array.from({ length: 20 }, (_, index) => ({
        uri: `https://picsum.photos/300/300?random=${index}`,
        type: index % 4 === 0 ? 'video' : 'photo',
        fileName: `media_${index}`,
        timestamp: Date.now() - index * 1000000,
      }));

      setGalleryAssets(mockAssets);
    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  };

  const handleCameraPress = async () => {
    try {
      const mediaFiles = await openCamera();
      if (mediaFiles.length > 0) {
        setSelectedMedia(prev => [...prev, ...mediaFiles]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Ошибка', 'Не удалось открыть камеру');
    }
  };

  const handleGalleryItemPress = (asset: GalleryAsset) => {
    const mediaFile: MediaFile = {
      uri: asset.uri,
      type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
      fileName: asset.fileName,
    };

    const isSelected = selectedMedia.some(item => item.uri === asset.uri);
    if (isSelected) {
      setSelectedMedia(prev => prev.filter(item => item.uri !== asset.uri));
    } else {
      setSelectedMedia(prev => [...prev, mediaFile]);
    }
  };

  const handleSend = () => {
    onSend(messageText, selectedMedia);
    setMessageText('');
    setSelectedMedia([]);
    onClose();
  };

  const renderGalleryItem = ({ item, index }: { item: GalleryAsset; index: number }) => {
    const isSelected = selectedMedia.some(media => media.uri === item.uri);
    const selectedIndex = selectedMedia.findIndex(media => media.uri === item.uri);

    return (
      <TouchableOpacity
        style={[styles.galleryItem, isSelected && styles.selectedGalleryItem]}
        onPress={() => handleGalleryItemPress(item)}
      >
        <Image source={{ uri: item.uri }} style={styles.galleryImage} />
        {item.type === 'video' && (
          <View style={styles.videoIndicator}>
            <View style={styles.playIcon} />
          </View>
        )}
        {isSelected && (
          <View style={styles.selectionBadge}>
            <Text style={styles.selectionNumber}>{selectedIndex + 1}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCameraButton = () => (
    <TouchableOpacity style={styles.cameraButton} onPress={handleCameraPress}>
      <View style={styles.cameraIcon}>
        <View style={styles.cameraIconInner} />
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.fullScreenContainer}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}
        >
        <TouchableOpacity 
          style={styles.modalContent}
          activeOpacity={1}
          onPress={() => {}} // Предотвращаем закрытие при нажатии на контент
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
          >
            <SafeAreaView style={styles.safeArea}>
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeText}>Закрыть</Text>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Недавние</Text>
                </View>
                <View style={styles.headerRight}>
                  {selectedMedia.length > 0 && (
                    <View style={styles.selectedCount}>
                      <Text style={styles.selectedCountText}>{selectedMedia.length}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Media Grid */}
              <View style={styles.mediaContainer}>
                <FlatList
                  data={[{ type: 'camera' }, ...galleryAssets]}
                  renderItem={({ item, index }) => {
                    if ('type' in item && item.type === 'camera') {
                      return renderCameraButton();
                    }
                    return renderGalleryItem({ item: item as GalleryAsset, index: index - 1 });
                  }}
                  keyExtractor={(item, index) => 
                    'type' in item && item.type === 'camera' ? 'camera' : `${index}`
                  }
                  numColumns={3}
                  contentContainerStyle={styles.gridContent}
                  showsVerticalScrollIndicator={false}
                />
              </View>

              {/* Bottom Input */}
              <View style={styles.bottomContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Добавить подпись..."
                    placeholderTextColor="#8B8B8B"
                    value={messageText}
                    onChangeText={setMessageText}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (selectedMedia.length === 0 && !messageText.trim()) && styles.sendButtonDisabled
                    ]}
                    onPress={handleSend}
                    disabled={selectedMedia.length === 0 && !messageText.trim()}
                  >
                    <Text style={styles.sendButtonText}>Отправить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </TouchableOpacity>
      </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: screenHeight * 0.67, // 2/3 от высоты экрана
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1C1C1E',
  },
  closeButton: {
    padding: 8,
    zIndex: 1,
  },
  closeText: {
    color: '#007AFF',
    fontSize: 17,
    fontFamily: 'Commissioner',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Commissioner',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCount: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  selectedCountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Commissioner',
  },
  mediaContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gridContent: {
    padding: 16,
  },
  cameraButton: {
    width: itemSize,
    height: itemSize,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  cameraIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#48484A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIconInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  galleryItem: {
    width: itemSize,
    height: itemSize,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedGalleryItem: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
  playIcon: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 0,
    borderBottomWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
  },
  selectionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Commissioner',
  },
  bottomContainer: {
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Commissioner',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sendButtonDisabled: {
    backgroundColor: '#48484A',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Commissioner',
  },
});