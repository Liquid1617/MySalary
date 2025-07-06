import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { homeScreenStyles, layoutStyles, typographyStyles } from '../styles';

export const ChatScreen: React.FC = () => {
  return (
    <SafeAreaView style={homeScreenStyles.container}>
      <ScrollView style={homeScreenStyles.content}>
        <View style={homeScreenStyles.header}>
          <Text style={[typographyStyles.h1, homeScreenStyles.welcomeTitle]}>
            AI Assistant 🤖
          </Text>
          <Text style={[typographyStyles.body1, homeScreenStyles.subtitle]}>
            Get personalized financial management advice
          </Text>
        </View>

        <View style={homeScreenStyles.mainContent}>
          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>💡</Text>
            <Text style={homeScreenStyles.featureTitle}>Financial Tips</Text>
            <Text style={homeScreenStyles.featureDescription}>
              Personalized budget planning recommendations
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>📈</Text>
            <Text style={homeScreenStyles.featureTitle}>Spending Analysis</Text>
            <Text style={homeScreenStyles.featureDescription}>
              Identify patterns in your expenses
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>🎯</Text>
            <Text style={homeScreenStyles.featureTitle}>
              Goal Planning
            </Text>
            <Text style={homeScreenStyles.featureDescription}>
              Help achieve your financial goals
            </Text>
          </View>
        </View>

        <View style={homeScreenStyles.footer}>
          <Text style={homeScreenStyles.comingSoonText}>
            AI chat in development...
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
