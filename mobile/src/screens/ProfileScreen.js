import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import * as Clipboard from 'expo-clipboard';
import { COLORS, FONTS } from '../styles/theme';
import { profileAPI, feedAPI } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('threads');
  const [trackingCode, setTrackingCode] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  
  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editAvatar, setEditAvatar] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Password Hash
  const [passwordHash, setPasswordHash] = useState('');
  const [fetchingHash, setFetchingHash] = useState(false);
  const [showHashModal, setShowHashModal] = useState(false);
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    loadUserData();
    loadTrackingCode();
    loadMyPosts();
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        setUserData(JSON.parse(userJson));
      }
      
      // Try to get fresh data from API
      try {
        const response = await profileAPI.get();
        setUserData(response.data);
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
      } catch (apiError) {
        // Use cached data if API fails
        console.log('Using cached user data');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadTrackingCode = async () => {
    try {
      const { applicationAPI } = require('../services/api');
      const response = await applicationAPI.getMine();
      if (response.data) {
        setTrackingCode(response.data.trackingCode);
        setApplicationStatus(response.data.status);
      }
    } catch (error) {
      // User might not have submitted application yet
      setTrackingCode(null);
      setApplicationStatus(null);
    }
  };

  const loadMyPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await feedAPI.getMyPosts();
      setMyPosts(response.data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
      setMyPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
    loadTrackingCode();
    loadMyPosts();
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      Animated.timing(drawerAnim, {
        toValue: -DRAWER_WIDTH,
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

  const handleCreateThread = () => {
    navigation.navigate('Feed');
    // Trigger create post modal
  };

  const handleEditProfile = () => {
    setEditFullName(userData?.fullName || '');
    setEditAvatar(userData?.profilePicture || null);
    setShowEditModal(true);
  };

  const handleGetHash = async () => {
    try {
      setFetchingHash(true);
      const response = await profileAPI.getPasswordHash();
      setPasswordHash(response.data.passwordHash);
      setShowHashModal(true);
    } catch (error) {
      console.error('Get hash error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to fetch password hash',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setFetchingHash(false);
    }
  };

  const handleCopyHash = async () => {
    try {
      await Clipboard.setStringAsync(passwordHash);
      Toast.show({
        type: 'success',
        text1: 'Copied',
        text2: 'Password hash copied to clipboard',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      console.error('Copy error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to copy to clipboard',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const handlePickImage = async () => {
    try {
      const { ImagePicker } = await import('expo-image-picker');
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Camera roll permission is required',
          position: 'top',
          topOffset: 60,
        });
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size (max 2MB)
        if (asset.fileSize && asset.fileSize > 2 * 1024 * 1024) {
          Toast.show({
            type: 'error',
            text1: 'File Too Large',
            text2: 'Please select an image under 2MB',
            position: 'top',
            topOffset: 60,
          });
          return;
        }

        setEditAvatar(asset.uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to pick image',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const handleRemoveAvatar = () => {
    setEditAvatar(null);
  };

  const handleSaveProfile = async () => {
    try {
      // Validate inputs
      if (!editFullName.trim()) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Full name is required',
          position: 'top',
          topOffset: 60,
        });
        return;
      }

      setSavingProfile(true);

      // Convert image to base64 if it's a new image
      let profilePictureData = editAvatar;
      if (editAvatar && editAvatar.startsWith('file://')) {
        const { FileSystem } = await import('expo-file-system');
        const base64 = await FileSystem.readAsStringAsync(editAvatar, {
          encoding: FileSystem.EncodingType.Base64,
        });
        profilePictureData = `data:image/jpeg;base64,${base64}`;
      }

      // Update profile
      const updateData = {
        fullName: editFullName.trim(),
        profilePicture: profilePictureData,
      };

      await profileAPI.update(updateData);

      // Refresh user data
      const response = await profileAPI.get();
      setUserData(response.data);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Profile updated successfully',
        position: 'top',
        topOffset: 60,
      });

      setShowEditModal(false);
    } catch (error) {
      console.error('Save profile error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to update profile',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header - Threads Style */}
      <View style={styles.header}>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={toggleDrawer}
          activeOpacity={0.6}
        >
          <Ionicons name="menu" size={24} color={COLORS.secondary} />
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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileTop}>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userData?.fullName || 'Student Name'}
              </Text>
              <Text style={styles.username}>
                {userData?.email?.split('@')[0] || 'username'}
              </Text>
              
              {/* Application Status Badge */}
              {applicationStatus && (
                <View style={[
                  styles.statusBadge,
                  applicationStatus === 'approved' && styles.statusApproved,
                  applicationStatus === 'pending' && styles.statusPending,
                  applicationStatus === 'rejected' && styles.statusRejected,
                ]}>
                  <Ionicons 
                    name={
                      applicationStatus === 'approved' ? 'checkmark-circle' :
                      applicationStatus === 'pending' ? 'time' : 'close-circle'
                    } 
                    size={14} 
                    color={COLORS.white} 
                  />
                  <Text style={styles.statusText}>
                    {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.avatarContainer}>
              {userData?.profilePicture ? (
                <Image
                  source={{ uri: userData.profilePicture }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userData?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Tracking Code Section */}
          {trackingCode && (
            <View style={styles.trackingSection}>
              <View style={styles.trackingHeader}>
                <Ionicons name="barcode-outline" size={18} color={COLORS.primary} />
                <Text style={styles.trackingLabel}>Tracking Code</Text>
              </View>
              <TouchableOpacity
                style={styles.trackingCodeBox}
                onPress={() => navigation.navigate('Tracking', { trackingCode })}
                activeOpacity={0.7}
              >
                <Text style={styles.trackingCode}>{trackingCode}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}

          {/* User Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{myPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {userData?.role === 'admin' ? 'Admin' : 'Student'}
              </Text>
              <Text style={styles.statLabel}>Role</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Edit profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.hashButton}
              onPress={handleGetHash}
              disabled={fetchingHash}
              activeOpacity={0.7}
            >
              {fetchingHash ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.hashButtonText}>Get Hash</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'threads' && styles.tabActive]}
            onPress={() => setActiveTab('threads')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'threads' && styles.tabTextActive]}>
              My Posts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'application' && styles.tabActive]}
            onPress={() => setActiveTab('application')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'application' && styles.tabTextActive]}>
              Application
            </Text>
          </TouchableOpacity>
      
        </View>

        {/* Tab Content */}
        {activeTab === 'threads' && (
          <View style={styles.tabContent}>
            {loadingPosts ? (
              <View style={styles.loadingPosts}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading posts...</Text>
              </View>
            ) : myPosts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubbles-outline" size={64} color={COLORS.lightGray} />
                <Text style={styles.emptyTitle}>No posts yet</Text>
                <Text style={styles.emptyDesc}>Share your thoughts with the community</Text>
                <TouchableOpacity style={styles.createPostButton} onPress={handleCreateThread} activeOpacity={0.8}>
                  <Text style={styles.createPostButtonText}>Create your first post</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.postsList}>
                {myPosts.map((post, index) => (
                  <View key={post.id || index} style={styles.postItem}>
                    <View style={styles.postHeader}>
                      <Text style={styles.postTimestamp}>{post.timestamp}</Text>
                    </View>
                    <Text style={styles.postContent}>{post.content}</Text>
                    <View style={styles.postFooter}>
                      <View style={styles.postStat}>
                        <Ionicons name="chatbubble-outline" size={16} color={COLORS.mediumGray} />
                        <Text style={styles.postStatText}>
                          {post.commentsCount || post.comments?.length || 0} replies
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'application' && (
          <View style={styles.tabContent}>
            {trackingCode ? (
              <View style={styles.applicationInfo}>
                <View style={styles.infoCard}>
                  <Ionicons name="document-text" size={32} color={COLORS.primary} />
                  <Text style={styles.infoTitle}>Application Status</Text>
                  <Text style={styles.infoStatus}>
                    {applicationStatus?.charAt(0).toUpperCase() + applicationStatus?.slice(1) || 'Submitted'}
                  </Text>
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    onPress={() => navigation.navigate('Tracking', { trackingCode })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.viewDetailsButtonText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={64} color={COLORS.lightGray} />
                <Text style={styles.emptyTitle}>No application yet</Text>
                <Text style={styles.emptyDesc}>You haven't submitted an application</Text>
              </View>
            )}
          </View>
        )}

        {/* Quick Actions - Only show if no application */}
        {!trackingCode && activeTab === 'threads' && myPosts.length === 0 && (
          <View style={styles.quickActionsSection}>
            <Text style={styles.quickActionsTitle}>Get Started</Text>
            <View style={styles.quickActions}>
              <View style={styles.actionCard}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="create-outline" size={32} color={COLORS.secondary} />
                </View>
                <Text style={styles.actionCardTitle}>Create post</Text>
                <Text style={styles.actionCardDesc}>
                  Share your thoughts with the community
                </Text>
                <TouchableOpacity 
                  style={styles.actionCardButton} 
                  onPress={handleCreateThread}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionCardButtonText}>Create</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionCard}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="document-text-outline" size={32} color={COLORS.secondary} />
                </View>
                <Text style={styles.actionCardTitle}>Apply now</Text>
                <Text style={styles.actionCardDesc}>
                  Submit your admission application
                </Text>
                <TouchableOpacity 
                  style={styles.actionCardButton}
                  onPress={() => navigation.navigate('Guidelines')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionCardButtonText}>Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate('Feed')}
          activeOpacity={0.6}
        >
          <Ionicons name="home-outline" size={26} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate('Tracking')}
          activeOpacity={0.6}
        >
          <Ionicons name="search-outline" size={26} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItemCenter}
          activeOpacity={0.6}
        >
          <Ionicons name="add" size={32} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.6}
        >
          <Ionicons name="notifications-outline" size={26} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          activeOpacity={0.6}
        >
          <Ionicons name="person" size={26} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowEditModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.editModal}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalTitle}>Edit Profile</Text>
                
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={savingProfile}
                  activeOpacity={0.6}
                >
                  {savingProfile ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Text style={styles.modalSave}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.editModalContent} showsVerticalScrollIndicator={false}>
                {/* Avatar Upload */}
                <View style={styles.avatarUploadSection}>
                  <Text style={styles.inputLabel}>Profile Picture</Text>
                  <View style={styles.avatarUploadContainer}>
                    {editAvatar ? (
                      <Image source={{ uri: editAvatar }} style={styles.avatarPreview} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarPlaceholderText}>
                          {editFullName?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                      </View>
                    )}
                    <View style={styles.avatarActions}>
                      <TouchableOpacity
                        style={styles.avatarButton}
                        onPress={handlePickImage}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="camera" size={20} color={COLORS.white} />
                        <Text style={styles.avatarButtonText}>
                          {editAvatar ? 'Change' : 'Upload'}
                        </Text>
                      </TouchableOpacity>
                      {editAvatar && (
                        <TouchableOpacity
                          style={[styles.avatarButton, styles.avatarButtonRemove]}
                          onPress={handleRemoveAvatar}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash" size={20} color={COLORS.error} />
                          <Text style={[styles.avatarButtonText, { color: COLORS.error }]}>
                            Remove
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <Text style={styles.inputHint}>Max 2MB • JPG, PNG, GIF</Text>
                </View>

                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editFullName}
                    onChangeText={setEditFullName}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.mediumGray}
                    autoCapitalize="words"
                  />
                </View>

                {/* Email (Read-only) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <View style={styles.inputReadOnly}>
                    <Text style={styles.inputReadOnlyText}>{userData?.email}</Text>
                    <Ionicons name="lock-closed" size={16} color={COLORS.mediumGray} />
                  </View>
                  <Text style={styles.inputHint}>Email cannot be changed</Text>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Drawer - Threads Settings Style */}
      {isDrawerOpen && (
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={toggleDrawer}
        >
          <Animated.View
            style={[
              styles.drawer,
              {
                transform: [{ translateX: drawerAnim }],
              },
            ]}
          >
            {/* Drawer Header */}
            <View style={styles.drawerHeader}>
              <TouchableOpacity onPress={toggleDrawer} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
              </TouchableOpacity>
              <Text style={styles.drawerTitle}>Settings</Text>
            </View>

            {/* Drawer Content */}
            <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
              {/* Menu Items */}
              <View style={styles.drawerMenu}>
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    toggleDrawer();
                    setTimeout(() => navigation.navigate('Notifications'), 300);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="notifications-outline" size={26} color={COLORS.secondary} />
                  <Text style={styles.drawerItemText}>Notifications</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    toggleDrawer();
                    setTimeout(() => navigation.navigate('PrivacySecurity'), 300);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="lock-closed-outline" size={26} color={COLORS.secondary} />
                  <Text style={styles.drawerItemText}>Privacy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    toggleDrawer();
                    // Already on profile
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-outline" size={26} color={COLORS.secondary} />
                  <Text style={styles.drawerItemText}>Account</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    Toast.show({
                      type: 'info',
                      text1: 'Help',
                      text2: 'Feature coming soon',
                      position: 'top',
                      topOffset: 60,
                    });
                    toggleDrawer();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="help-circle-outline" size={26} color={COLORS.secondary} />
                  <Text style={styles.drawerItemText}>Help</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    Toast.show({
                      type: 'info',
                      text1: 'About',
                      text2: 'CTU Admission Portal v1.0',
                      position: 'top',
                      topOffset: 60,
                    });
                    toggleDrawer();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="information-circle-outline" size={26} color={COLORS.secondary} />
                  <Text style={styles.drawerItemText}>About</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Actions */}
              <View style={styles.drawerBottom}>
                <TouchableOpacity
                  style={styles.drawerBottomItem}
                  onPress={() => {
                    Toast.show({
                      type: 'info',
                      text1: 'Switch Accounts',
                      text2: 'Feature coming soon',
                      position: 'top',
                      topOffset: 60,
                    });
                    toggleDrawer();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.drawerBottomText}>Switch accounts</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.drawerBottomItem}
                  onPress={handleLogout}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.drawerBottomText, { color: COLORS.error }]}>Log out</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </TouchableOpacity>
      )}
      
      {/* Password Hash Modal */}
      <Modal
        visible={showHashModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHashModal(false)}
      >
        <View style={styles.hashModalOverlay}>
          <View style={styles.hashModalContainer}>
            <View style={styles.hashModalHeader}>
              <Text style={styles.hashModalTitle}>Password Hash</Text>
              <TouchableOpacity
                onPress={() => setShowHashModal(false)}
                style={styles.hashModalClose}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.hashModalContent}>
              <View style={styles.hashInfoBox}>
                <Ionicons name="information-circle" size={24} color={COLORS.primary} />
                <Text style={styles.hashInfoText}>
                  This is your bcrypt password hash stored in the database. Keep it secure!
                </Text>
              </View>

              <View style={styles.hashBox}>
                <ScrollView 
                  style={styles.hashScrollView}
                  showsVerticalScrollIndicator={true}
                >
                  <Text style={styles.hashText} selectable={true}>
                    {passwordHash}
                  </Text>
                </ScrollView>
              </View>

              <TouchableOpacity
                style={styles.copyHashButton}
                onPress={handleCopyHash}
                activeOpacity={0.7}
              >
                <Ionicons name="copy-outline" size={20} color={COLORS.white} />
                <Text style={styles.copyHashButtonText}>Copy to Clipboard</Text>
              </TouchableOpacity>

              <View style={styles.hashWarningBox}>
                <Ionicons name="warning" size={20} color={COLORS.warning} />
                <Text style={styles.hashWarningText}>
                  Never share your password hash with anyone. This is sensitive security information.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  // Content
  content: {
    flex: 1,
  },
  // Profile Header
  profileHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  profileTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.regular,
    marginBottom: 8,
  },
  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusApproved: {
    backgroundColor: '#4CAF50',
  },
  statusPending: {
    backgroundColor: '#FF9800',
  },
  statusRejected: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  // Tracking Section
  trackingSection: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  trackingLabel: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.medium,
  },
  trackingCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  trackingCode: {
    fontSize: 16,
    color: COLORS.primary,
    ...FONTS.bold,
    letterSpacing: 1,
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.lightGray,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarText: {
    fontSize: 24,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  addButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  editButtonFull: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  hashButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  hashButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  editButtonText: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  // Tabs
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 15,
    color: COLORS.mediumGray,
    ...FONTS.medium,
  },
  tabTextActive: {
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  // Tab Content
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  loadingPosts: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    textAlign: 'center',
    marginBottom: 24,
  },
  createPostButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
  },
  createPostButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  // Posts List
  postsList: {
    gap: 16,
  },
  postItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  postHeader: {
    marginBottom: 8,
  },
  postTimestamp: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  postContent: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postStatText: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  // Application Info
  applicationInfo: {
    alignItems: 'center',
  },
  infoCard: {
    width: '100%',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginTop: 16,
    marginBottom: 8,
  },
  infoStatus: {
    fontSize: 16,
    color: COLORS.primary,
    ...FONTS.bold,
    marginBottom: 24,
  },
  viewDetailsButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
  },
  viewDetailsButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  // Settings List
  settingsList: {
    gap: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  // Quick Actions Section
  quickActionsSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderTopWidth: 8,
    borderTopColor: COLORS.ultraLightGray,
  },
  quickActionsTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 16,
  },
  // Finish Profile
  finishProfile: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  finishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  finishTitle: {
    fontSize: 16,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  finishCount: {
    fontSize: 16,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionCardTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 8,
    textAlign: 'center',
  },
  actionCardDesc: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  actionCardButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
  },
  actionCardButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingBottom: 20,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.lightGray,
  },
  bottomNavItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavItemCenter: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Drawer Styles
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  drawerTitle: {
    fontSize: 20,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  drawerContent: {
    flex: 1,
  },
  drawerMenu: {
    paddingTop: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 20,
  },
  drawerItemText: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  drawerBottom: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.lightGray,
    marginTop: 16,
  },
  drawerBottomItem: {
    paddingVertical: 12,
  },
  drawerBottomText: {
    fontSize: 16,
    color: COLORS.primary,
    ...FONTS.regular,
  },
  // Edit Profile Modal
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  editModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalCancel: {
    fontSize: 16,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  modalTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  modalSave: {
    fontSize: 16,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  editModalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  inputReadOnly: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.ultraLightGray,
  },
  inputReadOnlyText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginTop: 4,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
  },
  passwordField: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  eyeButton: {
    padding: 12,
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.medium,
    marginHorizontal: 12,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 18,
  },
  // Avatar Upload
  avatarUploadSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  avatarUploadContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholderText: {
    fontSize: 48,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  avatarButtonRemove: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  avatarButtonText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  // Password Hash Modal
  hashModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  hashModalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  hashModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  hashModalTitle: {
    fontSize: 20,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  hashModalClose: {
    padding: 4,
  },
  hashModalContent: {
    padding: 20,
  },
  hashInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  hashInfoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 20,
  },
  hashBox: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  hashScrollView: {
    maxHeight: 180,
  },
  hashText: {
    fontSize: 12,
    color: COLORS.secondary,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  copyHashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  copyHashButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  hashWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.warning + '10',
    padding: 16,
    borderRadius: 12,
  },
  hashWarningText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 18,
  },
});

export default ProfileScreen;
