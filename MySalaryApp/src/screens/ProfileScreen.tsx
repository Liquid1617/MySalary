import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { profileScreenStyles, layoutStyles, typographyStyles } from '../styles';
import { apiService } from '../services/api';
import { AddAccountModal } from '../components/AddAccountModal';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
    loadAccounts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      const storedUser = await apiService.getStoredUser();
      
      if (storedUser) {
        setUser(storedUser);
      } else {
        // Пока используем mock данные, позже можно подключить API
        const mockUser = {
          id: 1,
          login: 'testuser',
          email: 'test@example.com',
          avatar: null,
        };
        setUser(mockUser);
      }
    } catch (error) {
      console.error('Ошибка загрузки профиля:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить профиль');
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      setAccountsLoading(true);
      const accountsData = await apiService.get<any[]>('/accounts');
      setAccounts(accountsData || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

  const handleAccountAdded = () => {
    loadAccounts();
  };

  const formatAccountType = (type: string) => {
    const types = {
      cash: 'Наличные',
      debit_card: 'Дебетовая карта',
      credit_card: 'Кредитная карта',
      bank_account: 'Банковский счет',
      digital_wallet: 'Цифровой кошелек',
    };
    return types[type as keyof typeof types] || type;
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={profileScreenStyles.container}>
        <View style={profileScreenStyles.content}>
          <Text style={typographyStyles.body1}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={profileScreenStyles.container}>
      <ScrollView style={profileScreenStyles.content}>
        <View style={profileScreenStyles.header}>
          <TouchableOpacity 
            onPress={handleClose} 
            style={profileScreenStyles.closeButton}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={profileScreenStyles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[typographyStyles.h2, profileScreenStyles.title]}>
              Profile
            </Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <View style={profileScreenStyles.avatarContainer}>
          <View style={profileScreenStyles.avatarWrapper}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={profileScreenStyles.avatar} />
            ) : (
              <View style={profileScreenStyles.avatarPlaceholder}>
                <Text style={profileScreenStyles.avatarText}>
                  {user?.login ? user.login.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={profileScreenStyles.infoContainer}>
          <View style={profileScreenStyles.infoCard}>
            <Text style={profileScreenStyles.infoLabel}>Username</Text>
            <Text style={profileScreenStyles.infoValue}>
              {user?.login || 'Not specified'}
            </Text>
          </View>

          <View style={profileScreenStyles.infoCard}>
            <Text style={profileScreenStyles.infoLabel}>Email</Text>
            <Text style={profileScreenStyles.infoValue}>
              {user?.email || 'Not specified'}
            </Text>
          </View>
        </View>

        {/* Accounts section */}
        <View style={profileScreenStyles.infoContainer}>
          <View style={profileScreenStyles.sectionHeader}>
            <Text style={[typographyStyles.h3, profileScreenStyles.sectionTitle]}>
              Accounts
            </Text>
            <TouchableOpacity 
              style={profileScreenStyles.addButton}
              onPress={() => setShowAddAccountModal(true)}
            >
              <Text style={profileScreenStyles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {accountsLoading ? (
            <View style={profileScreenStyles.infoCard}>
              <Text style={typographyStyles.body1}>Loading accounts...</Text>
            </View>
          ) : accounts.length === 0 ? (
            <View style={profileScreenStyles.infoCard}>
              <Text style={typographyStyles.body1}>You don't have any accounts yet</Text>
              <Text style={typographyStyles.caption}>
                Add your first account to track income and expenses
              </Text>
            </View>
          ) : (
            accounts.map((account) => (
              <View key={account.id} style={profileScreenStyles.accountCard}>
                <View style={profileScreenStyles.accountHeader}>
                  <Text style={profileScreenStyles.accountName}>{account.account_name}</Text>
                  <Text style={profileScreenStyles.accountBalance}>
                    {account.balance} {account.currency?.symbol || ''}
                  </Text>
                </View>
                <Text style={profileScreenStyles.accountType}>
                  {formatAccountType(account.account_type)}
                </Text>
                {account.description && (
                  <Text style={profileScreenStyles.accountDescription}>
                    {account.description}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

      </ScrollView>

      <AddAccountModal
        visible={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        onAccountAdded={handleAccountAdded}
      />
    </SafeAreaView>
  );
}; 