import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { homeScreenStyles, layoutStyles, typographyStyles } from '../styles';

export const StatisticsScreen: React.FC = () => {
  return (
    <SafeAreaView style={homeScreenStyles.container}>
      <ScrollView style={homeScreenStyles.content}>
        <View style={homeScreenStyles.header}>
          <Text style={[typographyStyles.h1, homeScreenStyles.welcomeTitle]}>
            Statistics 📊
          </Text>
          <Text style={[typographyStyles.body1, homeScreenStyles.subtitle]}>
            Analyze your finances and track progress
          </Text>
        </View>

        <View style={homeScreenStyles.mainContent}>
          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>📊</Text>
            <Text style={homeScreenStyles.featureTitle}>
              Charts and Graphs
            </Text>
            <Text style={homeScreenStyles.featureDescription}>
              Visualize income and expenses
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>📅</Text>
            <Text style={homeScreenStyles.featureTitle}>
              Period Reports
            </Text>
            <Text style={homeScreenStyles.featureDescription}>
              Monthly, quarterly, and yearly reports
            </Text>
          </View>

          <View style={homeScreenStyles.featureCard}>
            <Text style={homeScreenStyles.featureEmoji}>🏆</Text>
            <Text style={homeScreenStyles.featureTitle}>Achievements</Text>
            <Text style={homeScreenStyles.featureDescription}>
              Progress toward financial goals
            </Text>
          </View>
        </View>

        <View style={homeScreenStyles.footer}>
          <Text style={homeScreenStyles.comingSoonText}>
            Detailed statistics in development...
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
