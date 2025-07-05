import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomButton } from '../components/CustomButton';
import { CustomInput } from '../components/CustomInput';
import { CustomSelect } from '../components/CustomSelect';
import { styles } from '../styles/screens/AddTransactionScreen.styles';

const transactionTypes = [
  { id: 'income', name: 'Доход' },
  { id: 'expense', name: 'Расход' },
];

type AddTransactionScreenProps = {
  navigation: NativeStackNavigationProp<any, 'AddTransaction'>;
};

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({
  navigation,
}) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    // TODO: Implement transaction submission
    console.log({ type, amount, description });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Добавить транзакцию</Text>

        <CustomSelect
          label="Тип транзакции"
          options={transactionTypes}
          value={type}
          onSelect={option => setType(option.id as string)}
        />

        <CustomInput
          label="Сумма"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Введите сумму"
        />

        <CustomInput
          label="Описание"
          value={description}
          onChangeText={setDescription}
          placeholder="Введите описание"
          multiline
        />

        <CustomButton
          title="Сохранить"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
