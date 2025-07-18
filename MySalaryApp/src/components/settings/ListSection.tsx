import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '../../styles/tokens';

interface ListSectionProps {
  title: string;
  children: React.ReactNode;
  style?: any;
}

export const ListSection: React.FC<ListSectionProps> = ({ title, children, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.header}>{title}</Text>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: tokens.spacing.xl,
  },
  header: {
    ...tokens.typography.sectionHeader,
    marginBottom: tokens.spacing.sm,
    marginHorizontal: tokens.spacing.lg,
  },
  content: {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.md,
    overflow: 'hidden',
  },
});