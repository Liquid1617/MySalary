import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { countryCodeSelectorStyles } from '../styles/components/CountryCodeSelector.styles';

interface CountryCode {
  name: string;
  dialCode: string;
  isoCode: string;
  flag: string;
}

interface CountryCodeSelectorProps {
  selectedCountryCode: string;
  onCountryCodeChange: (dialCode: string, isoCode: string) => void;
  loading?: boolean;
}

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({
  selectedCountryCode,
  onCountryCodeChange,
  loading = false,
}) => {
  const [countries, setCountries] = useState<CountryCode[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(true);

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await fetch(
        'https://gist.githubusercontent.com/kcak11/4a2f22fb8422342b3b3daa7a1965f4e4/raw/countries.json',
      );
      const data = await response.json();

      // Сортируем по названию и добавляем популярные страны в начало
      const popularCountries = [
        'RU',
        'US',
        'GB',
        'DE',
        'FR',
        'CN',
        'IN',
        'CA',
        'AU',
        'BR',
      ];
      const popular = data.filter((country: CountryCode) =>
        popularCountries.includes(country.isoCode),
      );
      const others = data.filter(
        (country: CountryCode) => !popularCountries.includes(country.isoCode),
      );

      popular.sort(
        (a: CountryCode, b: CountryCode) =>
          popularCountries.indexOf(a.isoCode) -
          popularCountries.indexOf(b.isoCode),
      );
      others.sort((a: CountryCode, b: CountryCode) =>
        a.name.localeCompare(b.name),
      );

      setCountries([...popular, ...others]);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoadingCountries(false);
    }
  };

  const selectedCountry = countries.find(
    country => country.dialCode === selectedCountryCode,
  );

  const renderCountryItem = ({ item }: { item: CountryCode }) => (
    <TouchableOpacity
      style={countryCodeSelectorStyles.countryItem}
      onPress={() => {
        onCountryCodeChange(item.dialCode, item.isoCode);
        setModalVisible(false);
      }}>
      <Image
        source={{ uri: item.flag }}
        style={countryCodeSelectorStyles.flagImage}
        resizeMode="contain"
      />
      <Text style={countryCodeSelectorStyles.countryName}>{item.name}</Text>
      <Text style={countryCodeSelectorStyles.dialCode}>{item.dialCode}</Text>
    </TouchableOpacity>
  );

  if (loadingCountries) {
    return (
      <View style={countryCodeSelectorStyles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[
          countryCodeSelectorStyles.selector,
          loading && countryCodeSelectorStyles.selectorLoading,
        ]}
        onPress={() => setModalVisible(true)}
        disabled={loading}>
        {selectedCountry ? (
          <>
            <Image
              source={{ uri: selectedCountry.flag }}
              style={countryCodeSelectorStyles.selectedFlag}
              resizeMode="contain"
            />
            <Text style={countryCodeSelectorStyles.selectedCode}>
              {selectedCountry.dialCode}
            </Text>
          </>
        ) : (
          <Text style={countryCodeSelectorStyles.placeholder}>+7</Text>
        )}
        <Text style={countryCodeSelectorStyles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={countryCodeSelectorStyles.modalContainer}>
          <View style={countryCodeSelectorStyles.modalContent}>
            <View style={countryCodeSelectorStyles.modalHeader}>
              <Text style={countryCodeSelectorStyles.modalTitle}>
                Select Country
              </Text>
              <TouchableOpacity
                style={countryCodeSelectorStyles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text style={countryCodeSelectorStyles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={countries}
              renderItem={renderCountryItem}
              keyExtractor={item => item.isoCode}
              style={countryCodeSelectorStyles.countryList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

export default CountryCodeSelector;
