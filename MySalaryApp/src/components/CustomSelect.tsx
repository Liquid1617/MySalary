import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { customSelectStyles } from '../styles/components/CustomSelect.styles';
import { typographyStyles } from '../styles';

interface SelectOption {
  id: string | number;
  name: string;
  code?: string;
}

interface CustomSelectProps {
  label: string;
  value?: string | number;
  options: SelectOption[];
  onSelect: (option: SelectOption) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Выберите вариант',
  error,
  disabled = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedOption = options.find(option => option.id === value);

  const handleSelect = (option: SelectOption) => {
    onSelect(option);
    setIsModalVisible(false);
  };

  const renderOption = ({ item }: { item: SelectOption }) => (
    <TouchableOpacity
      style={customSelectStyles.option}
      onPress={() => handleSelect(item)}>
      <Text style={[typographyStyles.body1, customSelectStyles.optionText]}>
        {item.name} {item.code && `(${item.code})`}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={customSelectStyles.container}>
      {label && (
        <Text style={[typographyStyles.body2, customSelectStyles.label]}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        style={[
          customSelectStyles.selectButton,
          error && customSelectStyles.selectButtonError,
          disabled && customSelectStyles.selectButtonDisabled,
        ]}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}>
        <Text
          style={[
            typographyStyles.body1,
            customSelectStyles.selectButtonText,
            !selectedOption && customSelectStyles.placeholderText,
          ]}>
          {selectedOption ? selectedOption.name : placeholder}
        </Text>
        <Text style={customSelectStyles.arrow}>▼</Text>
      </TouchableOpacity>

      {error && (
        <Text style={[typographyStyles.caption, customSelectStyles.error]}>
          {error}
        </Text>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={customSelectStyles.modalOverlay}>
          <View style={customSelectStyles.modalContent}>
            <View style={customSelectStyles.modalHeader}>
              <Text
                style={[typographyStyles.h3, customSelectStyles.modalTitle]}>
                {label}
              </Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={customSelectStyles.closeButton}>
                <Text style={customSelectStyles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              renderItem={renderOption}
              keyExtractor={item => item.id.toString()}
              style={customSelectStyles.optionsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};
