import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { homeScreenStyles, layoutStyles, typographyStyles } from '../styles';

export const StatisticsScreen: React.FC = () => {
  return (
    <SafeAreaView style={homeScreenStyles.container}>
      <ScrollView style={homeScreenStyles.content}>
        <View style={homeScreenStyles.header}>
          <Text style={[typographyStyles.h1, homeScreenStyles.welcomeTitle]}>
            Статистика 📊
          </Text>
          <Text style={[typographyStyles.body1, homeScreenStyles.subtitle]}>
            Анализируйте свои финансы и отслеживайте прогресс
          </Text>
        </View>

        <View style={homeScreenStyles.mainContent}>
          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>📊</Text>
            <Text style={homeScreenStyles.featureTitle}>
              Графики и диаграммы
            </Text>
            <Text style={homeScreenStyles.featureDescription}>
              Визуализация доходов и расходов
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>📅</Text>
            <Text style={homeScreenStyles.featureTitle}>
              Отчеты по периодам
            </Text>
            <Text style={homeScreenStyles.featureDescription}>
              Месячные, квартальные, годовые отчеты
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>🏆</Text>
            <Text style={homeScreenStyles.featureTitle}>Достижения</Text>
            <Text style={homeScreenStyles.featureDescription}>
              Прогресс в достижении финансовых целей
            </Text>
          </View>
        </View>

        <View style={homeScreenStyles.footer}>
          <Text style={homeScreenStyles.comingSoonText}>
            Детальная статистика находится в разработке...
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
