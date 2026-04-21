import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

const PrivacySecurityScreen = ({ navigation }) => {
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleToggle = (setter, value, name) => {
    setter(value);
    Toast.show({
      type: 'success',
      text1: value ? 'Enabled' : 'Disabled',
      text2: `${name} ${value ? 'enabled' : 'disabled'}`,
      position: 'top',
      topOffset: 60,
      visibilityTime: 2000,
    });
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear specific cache items (not auth tokens)
              await AsyncStorage.removeItem('@admission_form_draft');
              Toast.show({
                type: 'success',
                text1: 'Cache Cleared',
                text2: 'All cached data has been removed',
                position: 'top',
                topOffset: 60,
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to clear cache',
                position: 'top',
                topOffset: 60,
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Toast.show({
              type: 'info',
              text1: 'Contact Support',
              text2: 'Please contact support to delete your account',
              position: 'top',
              topOffset: 60,
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Privacy</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="person-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Profile Visibility</Text>
                <Text style={styles.settingDesc}>Make your profile visible to others</Text>
              </View>
            </View>
            <Switch
              value={profileVisibility}
              onValueChange={(value) => handleToggle(setProfileVisibility, value, 'Profile visibility')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
              thumbColor={profileVisibility ? COLORS.primary : COLORS.mediumGray}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.info + '15' }]}>
                <Ionicons name="mail-outline" size={22} color={COLORS.info} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Show Email</Text>
                <Text style={styles.settingDesc}>Display email on your profile</Text>
              </View>
            </View>
            <Switch
              value={showEmail}
              onValueChange={(value) => handleToggle(setShowEmail, value, 'Show email')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
              thumbColor={showEmail ? COLORS.primary : COLORS.mediumGray}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="call-outline" size={22} color={COLORS.success} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Show Phone Number</Text>
                <Text style={styles.settingDesc}>Display phone on your profile</Text>
              </View>
            </View>
            <Switch
              value={showPhone}
              onValueChange={(value) => handleToggle(setShowPhone, value, 'Show phone')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
              thumbColor={showPhone ? COLORS.primary : COLORS.mediumGray}
            />
          </View>
        </View>

        {/* Security Settings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.success} />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>

          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.7}
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Change Password',
                text2: 'Feature coming soon',
                position: 'top',
                topOffset: 60,
              });
            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="key-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingDesc}>Update your account password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.warning + '15' }]}>
                <Ionicons name="finger-print-outline" size={22} color={COLORS.warning} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                <Text style={styles.settingDesc}>Add extra security to your account</Text>
              </View>
            </View>
            <Switch
              value={twoFactorAuth}
              onValueChange={(value) => handleToggle(setTwoFactorAuth, value, 'Two-factor authentication')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
              thumbColor={twoFactorAuth ? COLORS.primary : COLORS.mediumGray}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.info + '15' }]}>
              <Ionicons name="time-outline" size={22} color={COLORS.info} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Login History</Text>
              <Text style={styles.settingDesc}>View your recent login activity</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="phone-portrait-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Active Sessions</Text>
              <Text style={styles.settingDesc}>Manage your active devices</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
        </View>

        {/* Data Management */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server-outline" size={24} color={COLORS.warning} />
            <Text style={styles.sectionTitle}>Data Management</Text>
          </View>

          <TouchableOpacity style={styles.actionItem} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: COLORS.info + '15' }]}>
              <Ionicons name="download-outline" size={22} color={COLORS.info} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Download Your Data</Text>
              <Text style={styles.settingDesc}>Get a copy of your information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.7}
            onPress={handleClearCache}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.warning + '15' }]}>
              <Ionicons name="trash-outline" size={22} color={COLORS.warning} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Clear Cache</Text>
              <Text style={styles.settingDesc}>Remove temporary data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning-outline" size={24} color={COLORS.error} />
            <Text style={[styles.sectionTitle, { color: COLORS.error }]}>Danger Zone</Text>
          </View>

          <TouchableOpacity 
            style={styles.actionItem} 
            activeOpacity={0.7}
            onPress={handleDeleteAccount}
          >
            <View style={[styles.iconContainer, { backgroundColor: COLORS.error + '15' }]}>
              <Ionicons name="close-circle-outline" size={22} color={COLORS.error} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: COLORS.error }]}>Delete Account</Text>
              <Text style={styles.settingDesc}>Permanently delete your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.secondary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: SIZES.md,
    ...SHADOWS.medium,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.white,
    ...FONTS.bold,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: SIZES.md,
    ...SHADOWS.small,
  },
  dangerCard: {
    backgroundColor: COLORS.error + '05',
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.error + '20',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 3,
  },
  settingDesc: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 16,
  },
});

export default PrivacySecurityScreen;
