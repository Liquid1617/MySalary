import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { typographyStyles } from '../styles';

interface GradientHeaderProps {
  title: string;
  avatarUrl?: string;
  userName?: string;
  ctaText?: string;
  onAvatarPress?: () => void;
  onCtaPress?: () => void;
}

const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  avatarUrl,
  userName = 'User',
  ctaText = 'Meet Ellroy',
  onAvatarPress,
  onCtaPress,
}) => {
  const renderAvatar = () => {
    if (avatarUrl) {
      return (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          onError={() => {
            // Handle avatar loading error gracefully
          }}
        />
      );
    }

    // Fallback to initials
    const initials = userName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <View style={styles.avatarFallback}>
        <Text style={styles.avatarInitials}>{initials}</Text>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#D1CCFF', '#8CE6F3', '#7AF0C4', '#C7FB33']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      useAngle={true}
      angle={30}
      style={styles.container}>
      <SafeAreaView>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <Text style={[typographyStyles.h1, styles.title]}>{title}</Text>
          </View>

          {(onAvatarPress || onCtaPress) && (
            <View style={styles.rightSection}>
              {onCtaPress && (
                <TouchableOpacity
                  style={styles.ctaButton}
                  onPress={onCtaPress}
                  activeOpacity={0.8}>
                  <Text style={styles.ctaText}>{ctaText}</Text>
                </TouchableOpacity>
              )}

              {onAvatarPress && (
                <TouchableOpacity
                  onPress={onAvatarPress}
                  style={styles.avatarContainer}
                  activeOpacity={0.8}>
                  {renderAvatar()}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 130,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  leftSection: {
    flex: 1,
  },
  title: {
    color: '#000000',
    fontSize: 32,
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GradientHeader;
