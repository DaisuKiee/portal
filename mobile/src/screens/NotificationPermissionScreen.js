import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

// Try to import expo-notifications, but handle if it's not installed
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch (e) {
  console.log('expo-notifications not installed, using fallback');
}

const NotificationPermissionScreen = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const requestPermission = async () => {
    try {
      if (Notifications) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        // Save permission status
        await AsyncStorage.setItem('notificationPermissionAsked', 'true');
        await AsyncStorage.setItem('notificationPermissionStatus', finalStatus);
      } else {
        // Fallback if expo-notifications is not installed
        await AsyncStorage.setItem('notificationPermissionAsked', 'true');
        await AsyncStorage.setItem('notificationPermissionStatus', 'granted');
      }

      onComplete();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      // Continue anyway
      await AsyncStorage.setItem('notificationPermissionAsked', 'true');
      onComplete();
    }
  };

  const skipPermission = async () => {
    try {
      await AsyncStorage.setItem('notificationPermissionAsked', 'true');
      await AsyncStorage.setItem('notificationPermissionStatus', 'denied');
      onComplete();
    } catch (error) {
      console.error('Error skipping permission:', error);
      onComplete();
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/ctubg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.content}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoBackground}>
            <Image
              source={require('../../assets/ctu.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="notifications" size={80} color={COLORS.primary} />
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>Stay Updated</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>
            Get notified about your application status, important updates, and announcements from CTU Daanbantayan Campus.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
              </View>
              <Text style={styles.featureText}>Application status updates</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: COLORS.info + '20' }]}>
                <Ionicons name="chatbubble-ellipses" size={32} color={COLORS.info} />
              </View>
              <Text style={styles.featureText}>New comments on your posts</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureIconBox, { backgroundColor: COLORS.warning + '20' }]}>
                <Ionicons name="megaphone" size={32} color={COLORS.warning} />
              </View>
              <Text style={styles.featureText}>Important announcements</Text>
            </View>
          </View>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          style={[
            styles.buttonsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.allowButton}
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <View style={styles.buttonGradient} />
            <Ionicons name="notifications" size={22} color={COLORS.white} />
            <Text style={styles.allowButtonText}>Allow Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={skipPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Maybe Later</Text>
            <Text style={styles.skipButtonSubtext}>You can change this anytime in settings</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.92)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.large,
  },
  logo: {
    width: 100,
    height: 100,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.white + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.primary + '40',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  title: {
    fontSize: 34,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: COLORS.white + 'DD',
    ...FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  featuresList: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  featureIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.medium,
    lineHeight: 20,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  allowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    height: 58,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  allowButtonText: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: 0.5,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  skipButtonText: {
    fontSize: 16,
    color: COLORS.white + 'DD',
    ...FONTS.semiBold,
    marginBottom: 4,
  },
  skipButtonSubtext: {
    fontSize: 12,
    color: COLORS.white + '99',
    ...FONTS.regular,
  },
});

export default NotificationPermissionScreen;
