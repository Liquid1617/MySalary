import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { tokens } from '../../styles/tokens';
import { apiService, Currency } from '../../services/api';

interface CurrencyBottomSheetProps {
  navigation: any;
  route: any;
}

interface CurrencyItem extends Currency {
  flag?: string;
}

export const CurrencyBottomSheet: React.FC<CurrencyBottomSheetProps> = ({ navigation, route }) => {
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<CurrencyItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const searchInputRef = useRef<TextInput>(null);

  const onCurrencySelect = route.params?.onCurrencySelect;

  useEffect(() => {
    loadCurrencies();
    // Auto-focus search input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  }, []);

  useEffect(() => {
    filterCurrencies();
  }, [searchQuery, currencies]);

  const loadCurrencies = async () => {
    try {
      const response = await apiService.getCurrencies();
      
      // Add flag emojis for popular currencies
      const currenciesWithFlags = response.currencies.map(currency => ({
        ...currency,
        flag: getCurrencyFlag(currency.code),
      }));
      
      setCurrencies(currenciesWithFlags);
      setFilteredCurrencies(currenciesWithFlags);
    } catch (error) {
      console.error('Error loading currencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyFlag = (code: string): string => {
    const flagMap: { [key: string]: string } = {
      'USD': '🇺🇸',
      'EUR': '🇪🇺',
      'GBP': '🇬🇧',
      'JPY': '🇯🇵',
      'AUD': '🇦🇺',
      'CAD': '🇨🇦',
      'CHF': '🇨🇭',
      'CNY': '🇨🇳',
      'RUB': '🇷🇺',
      'MDL': '🇲🇩',
      'RON': '🇷🇴',
      'UAH': '🇺🇦',
      'KZT': '🇰🇿',
      'BYN': '🇧🇾',
      'INR': '🇮🇳',
      'BRL': '🇧🇷',
      'MXN': '🇲🇽',
      'AED': '🇦🇪',
      'SGD': '🇸🇬',
      'HKD': '🇭🇰',
      'KRW': '🇰🇷',
      'THB': '🇹🇭',
      'VND': '🇻🇳',
      'MYR': '🇲🇾',
      'PHP': '🇵🇭',
      'IDR': '🇮🇩',
      'TRY': '🇹🇷',
      'ILS': '🇮🇱',
      'SAR': '🇸🇦',
      'EGP': '🇪🇬',
      'ZAR': '🇿🇦',
      'NGN': '🇳🇬',
      'GHS': '🇬🇭',
      'KES': '🇰🇪',
      'UGX': '🇺🇬',
      'TZS': '🇹🇿',
      'ETB': '🇪🇹',
      'MAD': '🇲🇦',
      'DZD': '🇩🇿',
      'TND': '🇹🇳',
      'LYD': '🇱🇾',
      'CLP': '🇨🇱',
      'ARS': '🇦🇷',
      'COP': '🇨🇴',
      'PEN': '🇵🇪',
      'UYU': '🇺🇾',
      'PYG': '🇵🇾',
      'BOB': '🇧🇴',
      'VES': '🇻🇪',
      'GYD': '🇬🇾',
      'SRD': '🇸🇷',
      'FKP': '🇫🇰',
    };
    
    return flagMap[code] || '💰';
  };

  const filterCurrencies = () => {
    if (!searchQuery.trim()) {
      setFilteredCurrencies(currencies);
      return;
    }

    const filtered = currencies.filter(currency =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredCurrencies(filtered);
  };

  const handleCurrencySelect = (currency: CurrencyItem) => {
    Keyboard.dismiss();
    onCurrencySelect?.(currency);
    navigation.goBack();
  };

  const renderCurrencyItem = ({ item }: { item: CurrencyItem }) => (
    <TouchableOpacity
      style={styles.currencyItem}
      onPress={() => handleCurrencySelect(item)}
      activeOpacity={0.6}>
      <View style={styles.currencyFlag}>
        <Text style={styles.flagText}>{item.flag}</Text>
      </View>
      <View style={styles.currencyInfo}>
        <Text style={styles.currencyCode}>{item.code}</Text>
        <Text style={styles.currencyName}>{item.name}</Text>
      </View>
      <Text style={styles.currencySymbol}>{item.symbol}</Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No currencies found</Text>
      <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Grabber */}
      <View style={styles.grabber} />
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={16} color={tokens.colors.textSecondary} />
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder="Search currency"
          placeholderTextColor={tokens.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FontAwesome5 name="times" size={16} color={tokens.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Currency List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.primary} />
          <Text style={styles.loadingText}>Loading currencies...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCurrencies}
          renderItem={renderCurrencyItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.surface,
  },
  grabber: {
    width: 36,
    height: 4,
    backgroundColor: tokens.colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: tokens.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: tokens.radius.sm,
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    marginHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.md,
    height: tokens.heights.textField,
  },
  searchInput: {
    flex: 1,
    marginLeft: tokens.spacing.sm,
    fontSize: 16,
    color: tokens.colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: tokens.spacing.md,
    color: tokens.colors.textSecondary,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: tokens.spacing.lg,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.lg,
    paddingVertical: tokens.spacing.md,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.divider,
  },
  currencyFlag: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing.md,
  },
  flagText: {
    fontSize: 16,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.textPrimary,
  },
  currencyName: {
    fontSize: 14,
    color: tokens.colors.textSecondary,
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: tokens.colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing.xxl,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: tokens.colors.textSecondary,
  },
});