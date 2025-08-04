import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { apiService } from '../services/api';

interface IconSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
  categoryType: 'income' | 'expense';
  selectedIcon?: string;
}

interface IconsData {
  income: string[];
  expense: string[];
}

export const IconSelector: React.FC<IconSelectorProps> = ({
  visible,
  onClose,
  onSelectIcon,
  categoryType,
  selectedIcon,
}) => {
  console.log('IconSelector rendered, visible:', visible, 'categoryType:', categoryType);
  const [icons, setIcons] = useState<IconsData>({ income: [], expense: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadIcons();
    }
  }, [visible]);

  const loadIcons = async () => {
    try {
      console.log('Loading icons...');
      setLoading(true);
      const response = await apiService.get<IconsData>('/categories/icons');
      console.log('Icons loaded:', response);
      console.log('Icons for type', categoryType, ':', response[categoryType]);
      setIcons(response);
    } catch (error) {
      console.error('Ошибка загрузки иконок:', error);
      console.error('Error details:', JSON.stringify(error));
      // Устанавливаем дефолтные иконки в случае ошибки
      const defaultIcons: IconsData = {
        income: [
          'money-bill-wave', 'coins', 'piggy-bank', 'chart-line', 'hand-holding-usd',
          'gift', 'graduation-cap', 'home', 'laptop', 'handshake'
        ],
        expense: [
          'shopping-cart', 'car', 'bolt', 'gamepad', 'tshirt', 'heartbeat',
          'graduation-cap', 'home', 'credit-card', 'utensils'
        ]
      };
      setIcons(defaultIcons);
    } finally {
      setLoading(false);
    }
  };

  const handleIconSelect = (icon: string) => {
    onSelectIcon(icon);
    onClose();
  };

  const currentIcons = icons[categoryType] || [];
  console.log('Current icons for rendering:', currentIcons, 'Length:', currentIcons.length);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Выберите иконку для категории {categoryType === 'income' ? 'доходов' : 'расходов'}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <FontAwesome5 name="times" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Загрузка иконок...</Text>
            </View>
          ) : (
            <ScrollView style={styles.iconsContainer} showsVerticalScrollIndicator={false}>
              <View style={styles.iconsGrid}>
                {currentIcons.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.iconButton,
                      selectedIcon === icon && styles.selectedIconButton,
                    ]}
                    onPress={() => handleIconSelect(icon)}
                  >
                    <FontAwesome5
                      name={icon}
                      size={24}
                      color={
                        selectedIcon === icon
                          ? '#FFFFFF'
                          : categoryType === 'income'
                          ? '#10B981'
                          : '#EF4444'
                      }
                      solid
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    width: width,
    maxHeight: height * 0.8,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  iconsContainer: {
    flex: 1,
    padding: 16,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: (width - 48) / 5, // 5 иконок в ряду с отступами
    height: (width - 48) / 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
});

export default IconSelector;