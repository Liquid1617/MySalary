import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { apiService } from '../services/api';

interface AddCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
  categoryType: 'income' | 'expense';
}

interface ColorOption {
  color: string;
  name: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { color: '#EF4444', name: 'Красный' },
  { color: '#F97316', name: 'Оранжевый' },
  { color: '#EAB308', name: 'Желтый' },
  { color: '#10B981', name: 'Зеленый' },
  { color: '#3B82F6', name: 'Синий' },
  { color: '#8B5CF6', name: 'Фиолетовый' },
  { color: '#EC4899', name: 'Розовый' },
  { color: '#6B7280', name: 'Серый' },
];

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  visible,
  onClose,
  onCategoryAdded,
  categoryType,
}) => {
  console.log('AddCategoryModal rendered, visible:', visible);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>(
    categoryType === 'income' ? '#10B981' : '#EF4444'
  );
  const [loading, setLoading] = useState(false);
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [availableIcons, setAvailableIcons] = useState<string[]>([]);
  const [loadingIcons, setLoadingIcons] = useState(false);
  console.log('showIconSelector state:', showIconSelector);

  useEffect(() => {
    console.log('showIconSelector changed to:', showIconSelector);
    if (showIconSelector && availableIcons.length === 0) {
      loadIcons();
    }
  }, [showIconSelector]);

  const loadIcons = async () => {
    try {
      setLoadingIcons(true);
      const response = await apiService.get<{income: string[], expense: string[]}>('/categories/icons');
      setAvailableIcons(response[categoryType] || []);
    } catch (error) {
      console.error('Error loading icons:', error);
      // Set default icons if API fails
      const defaultIcons = categoryType === 'income' 
        ? ['money-bill-wave', 'coins', 'piggy-bank', 'chart-line', 'hand-holding-usd']
        : ['shopping-cart', 'car', 'bolt', 'gamepad', 'tshirt'];
      setAvailableIcons(defaultIcons);
    } finally {
      setLoadingIcons(false);
    }
  };

  const resetForm = () => {
    setName('');
    setSelectedIcon('');
    setSelectedColor(categoryType === 'income' ? '#10B981' : '#EF4444');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Ошибка', 'Введите название категории');
      return;
    }

    if (!selectedIcon) {
      Alert.alert('Ошибка', 'Выберите иконку для категории');
      return;
    }

    try {
      setLoading(true);
      
      await apiService.post('/categories', {
        name: name.trim(),
        type: categoryType,
        icon: selectedIcon,
        color: selectedColor,
      });

      Alert.alert('Успех', 'Категория создана', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            onCategoryAdded();
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Ошибка создания категории:', error);
      Alert.alert(
        'Ошибка',
        error.message || 'Не удалось создать категорию'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>
                Новая категория {categoryType === 'income' ? 'доходов' : 'расходов'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <FontAwesome5 name="times" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Название категории */}
              <View style={styles.section}>
                <Text style={styles.label}>Название категории</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Введите название"
                  maxLength={50}
                  autoCapitalize="words"
                />
              </View>

              {/* Выбор иконки */}
              <View style={styles.section}>
                <Text style={styles.label}>Иконка</Text>
                <TouchableOpacity
                  style={styles.iconSelector}
                  onPress={() => {
                    console.log('Icon selector button pressed');
                    console.log('Toggling showIconSelector from:', showIconSelector);
                    setShowIconSelector(!showIconSelector);
                  }}
                >
                  {selectedIcon ? (
                    <>
                      <FontAwesome5
                        name={selectedIcon}
                        size={24}
                        color={selectedColor}
                        solid
                      />
                      <Text style={styles.iconSelectorText}>Изменить иконку</Text>
                    </>
                  ) : (
                    <>
                      <FontAwesome5
                        name="plus"
                        size={24}
                        color="#9CA3AF"
                      />
                      <Text style={styles.iconSelectorText}>Выбрать иконку</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Выбор цвета */}
              <View style={styles.section}>
                <Text style={styles.label}>Цвет</Text>
                <View style={styles.colorGrid}>
                  {COLOR_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: option.color },
                        selectedColor === option.color && styles.selectedColor,
                      ]}
                      onPress={() => setSelectedColor(option.color)}
                    >
                      {selectedColor === option.color && (
                        <FontAwesome5 name="check" size={16} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Предварительный просмотр */}
              {selectedIcon && (
                <View style={styles.section}>
                  <Text style={styles.label}>Предварительный просмотр</Text>
                  <View style={styles.preview}>
                    <FontAwesome5
                      name={selectedIcon}
                      size={24}
                      color={selectedColor}
                      solid
                    />
                    <Text style={styles.previewText}>
                      {name || 'Название категории'}
                    </Text>
                  </View>
                </View>
              )}
              {/* Inline Icon Selector */}
              {showIconSelector && (
                <View style={styles.section}>
                  <Text style={styles.label}>Выберите иконку</Text>
                  {loadingIcons ? (
                    <Text style={styles.loadingText}>Загрузка иконок...</Text>
                  ) : (
                    <View style={styles.iconGrid}>
                      {availableIcons.map((icon, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.iconOption,
                            selectedIcon === icon && styles.selectedIconOption,
                          ]}
                          onPress={() => {
                            setSelectedIcon(icon);
                            setShowIconSelector(false);
                          }}
                        >
                          <FontAwesome5
                            name={icon}
                            size={20}
                            color={
                              selectedIcon === icon
                                ? '#FFFFFF'
                                : selectedColor
                            }
                            solid
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading || !name.trim() || !selectedIcon}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Создание...' : 'Создать'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
      </Modal>

    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  iconSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  iconSelectorText: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#1F2937',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  previewText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 20,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconOption: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
});

export default AddCategoryModal;