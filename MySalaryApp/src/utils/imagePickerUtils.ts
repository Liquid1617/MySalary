import { Alert, Platform } from 'react-native';

// Динамический импорт react-native-image-picker для избежания проблем с автолинкингом
let ImagePicker: any = null;
try {
  ImagePicker = require('react-native-image-picker');
} catch (error) {
  console.warn('react-native-image-picker не найден:', error);
}

type MediaType = 'photo' | 'video' | 'mixed';

interface ImagePickerAsset {
  uri?: string;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

interface ImagePickerResponse {
  didCancel?: boolean;
  errorMessage?: string;
  assets?: ImagePickerAsset[];
}

export interface MediaFile {
  uri: string;
  type: string;
  fileName?: string;
  fileSize?: number;
}

const imagePickerOptions = {
  mediaType: 'mixed' as MediaType,
  includeBase64: false,
  maxHeight: 2000,
  maxWidth: 2000,
  quality: 0.8 as any,
  selectionLimit: 10, // Позволяем выбрать до 10 файлов
};

export const showImagePicker = (): Promise<MediaFile[]> => {
  return new Promise((resolve, reject) => {
    // Проверяем доступность библиотеки
    if (!ImagePicker || !ImagePicker.launchImageLibrary || !ImagePicker.launchCamera) {
      console.error('react-native-image-picker не подключена правильно');
      reject(new Error('Библиотека для работы с изображениями недоступна'));
      return;
    }

    Alert.alert(
      'Выберите источник',
      'Откуда хотите выбрать изображение?',
      [
        {
          text: 'Камера',
          onPress: () => {
            ImagePicker.launchCamera(imagePickerOptions, (response: ImagePickerResponse) => {
              handleImagePickerResponse(response, resolve, reject);
            });
          },
        },
        {
          text: 'Галерея',
          onPress: () => {
            ImagePicker.launchImageLibrary(imagePickerOptions, (response: ImagePickerResponse) => {
              handleImagePickerResponse(response, resolve, reject);
            });
          },
        },
        {
          text: 'Отмена',
          style: 'cancel',
          onPress: () => resolve([]),
        },
      ],
    );
  });
};

export const openImageLibrary = (): Promise<MediaFile[]> => {
  return new Promise((resolve, reject) => {
    if (!ImagePicker || !ImagePicker.launchImageLibrary) {
      reject(new Error('Библиотека для работы с изображениями недоступна'));
      return;
    }
    
    ImagePicker.launchImageLibrary(imagePickerOptions, (response: ImagePickerResponse) => {
      handleImagePickerResponse(response, resolve, reject);
    });
  });
};

export const openCamera = (): Promise<MediaFile[]> => {
  return new Promise((resolve, reject) => {
    if (!ImagePicker || !ImagePicker.launchCamera) {
      reject(new Error('Камера недоступна'));
      return;
    }
    
    ImagePicker.launchCamera(imagePickerOptions, (response: ImagePickerResponse) => {
      handleImagePickerResponse(response, resolve, reject);
    });
  });
};

const handleImagePickerResponse = (
  response: ImagePickerResponse,
  resolve: (value: MediaFile[]) => void,
  reject: (reason?: any) => void
) => {
  if (response.didCancel) {
    resolve([]);
    return;
  }

  if (response.errorMessage) {
    reject(new Error(response.errorMessage));
    return;
  }

  if (response.assets && response.assets.length > 0) {
    const mediaFiles: MediaFile[] = response.assets.map(asset => ({
      uri: asset.uri || '',
      type: asset.type || 'image/jpeg',
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      fileSize: asset.fileSize,
    }));
    resolve(mediaFiles);
  } else {
    resolve([]);
  }
};