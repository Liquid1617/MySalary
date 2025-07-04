import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { homeScreenStyles, layoutStyles, typographyStyles } from '../styles';

export const ChatScreen: React.FC = () => {
  return (
    <SafeAreaView style={homeScreenStyles.container}>
      <ScrollView style={homeScreenStyles.content}>
        <View style={homeScreenStyles.header}>
          <Text style={[typographyStyles.h1, homeScreenStyles.welcomeTitle]}>
            ИИ Помощник 🤖
          </Text>
          <Text style={[typographyStyles.body1, homeScreenStyles.subtitle]}>
            Получайте персональные советы по управлению финансами
          </Text>
        </View>

        <View style={homeScreenStyles.mainContent}>
          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>💡</Text>
            <Text style={homeScreenStyles.featureTitle}>Финансовые советы</Text>
            <Text style={homeScreenStyles.featureDescription}>
              Персональные рекомендации по планированию бюджета
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>📈</Text>
            <Text style={homeScreenStyles.featureTitle}>Анализ трат</Text>
            <Text style={homeScreenStyles.featureDescription}>
              Выявление закономерностей в расходах
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>🎯</Text>
            <Text style={homeScreenStyles.featureTitle}>
              Планирование целей
            </Text>
            <Text style={homeScreenStyles.featureDescription}>
              Помощь в достижении финансовых целей
            </Text>
          </View>
        </View>

        <View style={homeScreenStyles.footer}>
          <Text style={homeScreenStyles.comingSoonText}>
            ИИ чат находится в разработке...
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
