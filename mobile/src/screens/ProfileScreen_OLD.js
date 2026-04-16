import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { profileAPI, feedAPI, notificationAPI } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState(null);
  
  const drawerAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
  });

  useEffect(() => {
    loadUserData();
    loadMyPosts();
    loadUnreadCount();
    loadTrackingCode();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadTrackingCode = async () => {
    try {
      const { applicationAPI } = require('../services/api');
      const response = await applicationAPI.getMine();
      if (response.data && response.data.trackingCode) {
        setTrackingCode(response.data.trackingCode);
      }
    } catch (error) {
      console.error('Error loading tracking code:', error);
      // User might not have submitted application yet
    }
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      Animated.timing(drawerAnim, {
        toValue: -SCREEN_WIDTH * 0.75,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsDrawerOpen(false));
    } else {
      setIsDrawerOpen(true);
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const loadUserData = async () => {
    try {
      const response = await profileAPI.get();
      const user = response.data;
      setUserData(user);
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        contactNumber: user.contactNumber || '',
      });
      
      // Update local storage
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to local storage if API fails
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserData(user);
        setFormData({
          fullName: user.fullName || '',
          email: user.email || '',
          contactNumber: user.contactNumber || '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await profileAPI.update(formData);
      const updatedUser = response.data;
      
      // Update local storage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      setEditing(false);
      
      Toast.show({
        type: 'success',
        text1: 'Profile Updated',
        text2: 'Your profile has been updated successfully',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update profile',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: userData?.fullName || '',
      email: userData?.email || '',
      contactNumber: userData?.contactNumber || '',
    });
    setEditing(false);
  };

  const loadMyPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await feedAPI.getMyPosts();
      setMyPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoadingPosts(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMyPosts();
    loadUnreadCount();
    loadTrackingCode();
  };

  const handleLogout = async () => {
    toggleDrawer();
    setTimeout(async () => {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }, 300);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleDrawer}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => editing ? handleCancel() : setEditing(true)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={editing ? 'close' : 'create-outline'} 
            size={24} 
            color={COLORS.white} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={56} color={COLORS.primary} />
            </View>
            {editing && (
              <TouchableOpacity style={styles.cameraButton} activeOpacity={0.7}>
                <Ionicons name="camera" size={18} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.profileName}>{userData?.fullName || 'Student'}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="school-outline" size={14} color={COLORS.primary} />
            <Text style={styles.roleText}>Student</Text>
          </View>
        </View>

        {/* Personal Information Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Personal Information</Text>
          </View>

          {/* Tracking Code Section */}
          {trackingCode && (
            <>
              <View style={styles.trackingCodeContainer}>
                <View style={styles.trackingCodeHeader}>
                  <Ionicons name="barcode-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.trackingCodeLabel}>Your Tracking Code</Text>
                </View>
                <View style={styles.trackingCodeBox}>
                  <Text style={styles.trackingCodeText}>{trackingCode}</Text>
                  <TouchableOpacity
                    style={styles.trackButton}
                    onPress={() => navigation.navigate('Tracking', { trackingCode })}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="search" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.trackingCodeHint}>Use this code to track your application status</Text>
              </View>

              <View style={styles.divider} />
            </>
          )}

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={18} color={COLORS.mediumGray} />
              <Text style={styles.label}>Full Name</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                placeholder="Enter full name"
                placeholderTextColor={COLORS.mediumGray}
              />
            ) : (
              <Text style={styles.value}>{userData?.fullName || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="mail-outline" size={18} color={COLORS.mediumGray} />
              <Text style={styles.label}>Email Address</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email"
                placeholderTextColor={COLORS.mediumGray}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <Text style={styles.value}>{userData?.email || 'Not set'}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="call-outline" size={18} color={COLORS.mediumGray} />
              <Text style={styles.label}>Contact Number</Text>
            </View>
            {editing ? (
              <TextInput
                style={styles.input}
                value={formData.contactNumber}
                onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
                placeholder="Enter contact number"
                placeholderTextColor={COLORS.mediumGray}
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{userData?.contactNumber || 'Not set'}</Text>
            )}
          </View>
        </View>

        {/* Account Settings Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Account Settings</Text>
          </View>

          <TouchableOpacity 
            style={styles.settingItem} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: COLORS.primary + '15' }]}>
              <Ionicons name="lock-closed-outline" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Change Password</Text>
              <Text style={styles.settingDesc}>Update your password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.settingItem} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('NotificationSettings')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: COLORS.warning + '15' }]}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.warning} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Notifications</Text>
              <Text style={styles.settingDesc}>Manage notification preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.settingItem} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PrivacySecurity')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: COLORS.success + '15' }]}>
              <Ionicons name="shield-checkmark-outline" size={22} color={COLORS.success} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy & Security</Text>
              <Text style={styles.settingDesc}>Control your privacy settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        {editing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* My Posts Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="newspaper-outline" size={24} color={COLORS.info} />
            <Text style={styles.sectionTitle}>My Posts</Text>
            <View style={styles.postCount}>
              <Text style={styles.postCountText}>{myPosts.length}</Text>
            </View>
          </View>

          {loadingPosts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : myPosts.length === 0 ? (
            <View style={styles.emptyPosts}>
              <Ionicons name="chatbubbles-outline" size={48} color={COLORS.lightGray} />
              <Text style={styles.emptyPostsText}>No posts yet</Text>
              <Text style={styles.emptyPostsSubtext}>Share your thoughts with the community</Text>
            </View>
          ) : (
            <View style={styles.postsContainer}>
              {myPosts.map((post) => (
                <View key={post.id} style={styles.postItem}>
                  <View style={styles.postHeader}>
                    <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.postTimestamp}>{post.timestamp}</Text>
                  </View>
                  <Text style={styles.postContent} numberOfLines={3}>
                    {post.content}
                  </Text>
                  <View style={styles.postFooter}>
                    <View style={styles.postStat}>
                      <Ionicons name="chatbubble-outline" size={16} color={COLORS.mediumGray} />
                      <Text style={styles.postStatText}>
                        {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Drawer Navigation */}
      {isDrawerOpen && (
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={toggleDrawer}
        >
          <Animated.View
            style={[
              styles.drawer,
              { transform: [{ translateX: drawerAnim }] },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerHeaderTitle}>Menu</Text>
              <View style={styles.drawerHeaderIcons}>
                <TouchableOpacity 
                  style={styles.drawerHeaderIcon}
                  onPress={() => {
                    toggleDrawer();
                    setTimeout(() => navigation.navigate('NotificationSettings'), 300);
                  }}
                >
                  <Ionicons name="settings-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.drawerHeaderIcon}
                  onPress={() => {
                    toggleDrawer();
                    setTimeout(() => navigation.navigate('Tracking'), 300);
                  }}
                >
                  <Ionicons name="search-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.drawerHeaderIcon}
                  onPress={() => {
                    toggleDrawer();
                    setTimeout(() => navigation.navigate('Notifications'), 300);
                  }}
                >
                  <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                  {unreadCount > 0 && (
                    <View style={styles.headerNotificationDot} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* User Profile Section */}
            <TouchableOpacity
              style={styles.drawerProfile}
              onPress={() => {
                toggleDrawer();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.drawerProfileAvatar}>
                <Ionicons name="person" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.drawerProfileName}>
                {userData?.fullName || 'Student'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.mediumGray} />
            </TouchableOpacity>

            {/* Menu Grid */}
            <View style={styles.drawerMenu}>
              <View style={styles.menuGrid}>
                <TouchableOpacity
                  style={styles.menuGridItem}
                  onPress={() => {
                    toggleDrawer();
                    setTimeout(() => navigation.navigate('Feed'), 300);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: COLORS.info + '20' }]}>
                    <Ionicons name="chatbubbles" size={28} color={COLORS.info} />
                  </View>
                  <Text style={styles.menuItemText}>Feed</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuGridItem}
                  onPress={() => {
                    toggleDrawer();
                    setTimeout(() => navigation.navigate('Tracking'), 300);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
                    <Ionicons name="search" size={28} color={COLORS.primary} />
                  </View>
                  <Text style={styles.menuItemText}>Track Application</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuGridItem}
                  onPress={() => {
                    toggleDrawer();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: COLORS.success + '20' }]}>
                    <Ionicons name="person" size={28} color={COLORS.success} />
                  </View>
                  <Text style={styles.menuItemText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuGridItem}
                  onPress={() => {
                    toggleDrawer();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: COLORS.warning + '20' }]}>
                    <Ionicons name="bookmark" size={28} color={COLORS.warning} />
                  </View>
                  <Text style={styles.menuItemText}>Saved</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuGridItem}
                  onPress={() => {
                    toggleDrawer();
                    setTimeout(() => navigation.navigate('Notifications'), 300);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconContainer, { backgroundColor: COLORS.error + '20', position: 'relative' }]}>
                    <Ionicons name="notifications" size={28} color={COLORS.error} />
                    {unreadCount > 0 && (
                      <View style={styles.menuNotificationBadge}>
                        <Text style={styles.menuNotificationBadgeText}>
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.menuItemText}>Notifications</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.drawerDivider} />

              <TouchableOpacity
                style={styles.drawerLogoutItem}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                <Text style={styles.drawerLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  menuButton: {
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
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  profileHeaderCard: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.white,
    ...SHADOWS.small,
  },
  profileName: {
    fontSize: 24,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  roleText: {
    fontSize: 13,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    marginBottom: 12,
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
  inputGroup: {
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.semiBold,
  },
  value: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.regular,
    paddingVertical: 8,
    paddingLeft: 26,
  },
  input: {
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.regular,
    marginLeft: 26,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 16,
  },
  trackingCodeContainer: {
    marginBottom: 4,
  },
  trackingCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trackingCodeLabel: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.semiBold,
  },
  trackingCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
    gap: 12,
  },
  trackingCodeText: {
    flex: 1,
    fontSize: 20,
    color: COLORS.primary,
    ...FONTS.bold,
    letterSpacing: 2,
  },
  trackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  trackingCodeHint: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginTop: 8,
    paddingLeft: 28,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingIconContainer: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SIZES.md,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadiusSm,
    paddingVertical: 14,
    ...SHADOWS.small,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    paddingVertical: 14,
    gap: 8,
    ...SHADOWS.medium,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
  },
  postCount: {
    backgroundColor: COLORS.info + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  postCountText: {
    fontSize: 13,
    color: COLORS.info,
    ...FONTS.bold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyPostsText: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginTop: 12,
  },
  emptyPostsSubtext: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginTop: 4,
  },
  postsContainer: {
    gap: 12,
  },
  postItem: {
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: SIZES.borderRadiusSm,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  postTimestamp: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  postContent: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 20,
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postStatText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: COLORS.white,
    ...SHADOWS.large,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  drawerHeaderTitle: {
    fontSize: 24,
    color: COLORS.white,
    ...FONTS.bold,
  },
  drawerHeaderIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  drawerHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerNotificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  drawerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  drawerProfileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerProfileName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  drawerMenu: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: COLORS.white,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  menuGridItem: {
    width: '47%',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuNotificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  menuNotificationBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    ...FONTS.bold,
  },
  menuItemText: {
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    textAlign: 'center',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 16,
    marginHorizontal: 20,
  },
  drawerLogoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  drawerLogoutText: {
    fontSize: 16,
    color: COLORS.error,
    ...FONTS.semiBold,
  },
});

export default ProfileScreen;
