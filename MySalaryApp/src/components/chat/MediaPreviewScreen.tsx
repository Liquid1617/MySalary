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
import LinearGradient from 'react-native-linear-gradient';
import { openCamera, MediaFile } from '../../utils/imagePickerUtils';
import { DropdownArrowIcon } from '../icons/DropdownArrowIcon';

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
  isFavorite?: boolean;
}

type MediaCategory = 'recent' | 'favourites' | 'video';

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
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory>('recent');

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
        isFavorite: index % 5 === 0, // Every 5th item is favorite
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

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleCategorySelect = (category: MediaCategory) => {
    setSelectedCategory(category);
    setShowDropdown(false);
  };

  const getFilteredAssets = () => {
    switch (selectedCategory) {
      case 'favourites':
        return galleryAssets.filter(asset => asset.isFavorite);
      case 'video':
        return galleryAssets.filter(asset => asset.type === 'video');
      case 'recent':
      default:
        return galleryAssets;
    }
  };

  const getCategoryTitle = () => {
    switch (selectedCategory) {
      case 'favourites':
        return 'Favourites';
      case 'video':
        return 'Video';
      case 'recent':
      default:
        return 'Recent';
    }
  };

  const getCategoryCount = (category: MediaCategory) => {
    switch (category) {
      case 'favourites':
        return galleryAssets.filter(asset => asset.isFavorite).length;
      case 'video':
        return galleryAssets.filter(asset => asset.type === 'video').length;
      case 'recent':
      default:
        return galleryAssets.length;
    }
  };

  const getCategoryThumbnail = (category: MediaCategory) => {
    switch (category) {
      case 'favourites':
        return galleryAssets.find(asset => asset.isFavorite)?.uri;
      case 'video':
        return galleryAssets.find(asset => asset.type === 'video')?.uri;
      case 'recent':
      default:
        return galleryAssets[0]?.uri;
    }
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
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <TouchableOpacity style={styles.titleWrapper} onPress={handleDropdownToggle}>
                    <Text style={styles.title}>{getCategoryTitle()}</Text>
                    <DropdownArrowIcon width={8} height={5} color="#252233" />
                  </TouchableOpacity>
                </View>
                {showDropdown && (
                  <View style={styles.dropdown}>
                    {(['recent', 'favourites', 'video'] as MediaCategory[]).map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={styles.dropdownItem}
                        onPress={() => handleCategorySelect(category)}
                      >
                        <View style={styles.dropdownItemLeft}>
                          <Text style={styles.dropdownItemTitle}>
                            {category === 'recent' ? 'Recent' : category === 'favourites' ? 'Favourites' : 'Video'}
                          </Text>
                          <Text style={styles.dropdownItemCount}>
                            {getCategoryCount(category)} items
                          </Text>
                        </View>
                        {getCategoryThumbnail(category) && (
                          <Image
                            source={{ uri: getCategoryThumbnail(category) }}
                            style={styles.dropdownThumbnail}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
                  data={[{ type: 'camera' }, ...getFilteredAssets()]}
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
                    style={styles.customInput}
                    placeholder="Add a caption"
                    placeholderTextColor="#D3D6D7"
                    value={messageText}
                    onChangeText={setMessageText}
                  />
                  <TouchableOpacity
                    style={styles.sendButtonWrapper}
                    onPress={handleSend}
                    disabled={selectedMedia.length === 0 && !messageText.trim()}
                  >
                    <LinearGradient
                      colors={['#C6C2FF', '#72E1F5', '#53EFAE', '#B5FA01']}
                      locations={[0, 0.2788, 0.6875, 1]}
                      start={{ x: 0, y: 1 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.sendButton,
                        (selectedMedia.length === 0 && !messageText.trim()) && styles.sendButtonDisabled
                      ]}
                    >
                      <Text style={styles.sendButtonText}>Send</Text>
                    </LinearGradient>
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
    width: '100%',
    height: 532,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  closeButton: {
    padding: 8,
    zIndex: 1,
  },
  closeText: {
    fontFamily: 'Commissioner',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    color: '#10BC74',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 0,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 47,
    left: 117.5,
    width: 160,
    height: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 20,
    gap: 16,
  },
  dropdownItem: {
    width: 135,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemLeft: {
    flex: 1,
  },
  dropdownItemTitle: {
    fontFamily: 'Commissioner',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 16,
    color: '#252233',
  },
  dropdownItemCount: {
    fontFamily: 'Commissioner',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 14,
    color: '#D3D6D7',
    marginTop: 2,
  },
  dropdownThumbnail: {
    width: 18,
    height: 18,
    borderRadius: 2,
  },
  title: {
    fontFamily: 'Commissioner',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    color: '#252233',
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
    backgroundColor: '#FFFFFF',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingRight: 20,
    paddingBottom: 34, // Extended to include safe area
    paddingLeft: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customInput: {
    width: 288,
    height: 33,
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#FDFDFE',
    fontFamily: 'Commissioner',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    color: '#252233',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
  },
  sendButtonWrapper: {
    borderRadius: 30,
  },
  sendButton: {
    width: 76,
    height: 33,
    borderRadius: 30,
    paddingTop: 8,
    paddingRight: 22,
    paddingBottom: 8,
    paddingLeft: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontFamily: 'Commissioner',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    color: '#252233',
  },
});