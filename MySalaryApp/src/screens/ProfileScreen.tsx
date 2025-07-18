import React from 'react';
import { SettingsRoot } from './settings/SettingsRoot';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  return <SettingsRoot navigation={navigation} />;
};