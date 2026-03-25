import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

const NotificationSettingsScreen = ({ navigation }) => {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [newPosts, setNewPosts] = useState(true);
  const [comments, setComments] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* General Notifications */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>General</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="phone-portrait-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDesc}>Receive notifications on your device</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(value) => handleToggle(setPushNotifications, value, 'Push notifications')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
              thumbColor={pushNotifications ? COLORS.primary : COLORS.mediumGray}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.info + '15' }]}>
                <Ionicons name="mail-outline" size={22} color={COLORS.info} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDesc}>Receive updates via email</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={(value) => handleToggle(setEmailNotifications, value, 'Email notifications')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
              thumbColor={emailNotifications ? COLORS.primary : COLORS.mediumGray}
            />
          </View>
        </View>

        {/* Application Notifications */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={24} color={COLORS.success} />
            <Text style={styles.sectionTitle}>Application</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.success} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Application Updates</Text>
                <Text style={styles.settingDesc}>Status changes and updates</Text>
              </View>
            </View>
            <Switch
              value={applicationUpdates}
              onValueChange={(value) => handleToggle(setApplicationUpdates, value, 'Application updates')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
              thumbColor={applicationUpdates ? COLORS.primary : COLORS.mediumGray}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.warning + '15' }]}>
                <Ionicons name="alert-circle-outline" size={22} color={COLORS.warning} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>System Alerts</Text>
                <Text style={styles.settingDesc}>Important system messages</Text>
              </View>
            </View>
            <Switch
              value={systemAlerts}
              onValueChange={(value) => handleToggle(setSystemAlerts, value, 'System alerts')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
              thumbColor={systemAlerts ? COLORS.primary : COLORS.mediumGray}
            />
          </View>
        </View>

        {/* Community Notifications */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={24} color={COLORS.info} />
            <Text style={styles.sectionTitle}>Community</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.info + '15' }]}>
                <Ionicons name="newspaper-outline" size={22} color={COLORS.info} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>New Posts</Text>
                <Text style={styles.settingDesc}>Notifications for new posts</Text>
              </View>
            </View>
            <Switch
              value={newPosts}
              onValueChange={(value) => handleToggle(setNewPosts, value, 'New posts')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
              thumbColor={newPosts ? COLORS.primary : COLORS.mediumGray}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="chatbubble-outline" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Comments</Text>
                <Text style={styles.settingDesc}>When someone comments on your post</Text>
              </View>
            </View>
            <Switch
              value={comments}
              onValueChange={(value) => handleToggle(setComments, value, 'Comments')}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary + '50' }}
              thumbColor={comments ? COLORS.primary : COLORS.mediumGray}
            />
          </View>
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

export default NotificationSettingsScreen;
