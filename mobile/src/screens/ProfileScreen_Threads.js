import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../styles/theme';
import { profileAPI } from '../services/api';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('threads');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        setUserData(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
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
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.6}>
          <Ionicons name="stats-chart-outline" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        
        <View style={styles.headerSpacer} />
        
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.6}>
          <Ionicons name="search-outline" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.openDrawer()}
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
            </View>
            
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {userData?.fullName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <TouchableOpacity style={styles.addButton} activeOpacity={0.6}>
                <Ionicons name="add" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add Interests */}
          <TouchableOpacity style={styles.addInterests} activeOpacity={0.7}>
            <Ionicons name="add" size={16} color={COLORS.secondary} />
            <Text style={styles.addInterestsText}>Add interests</Text>
          </TouchableOpacity>

          {/* Followers */}
          <View style={styles.followersRow}>
            <View style={styles.followerAvatars}>
              <View style={[styles.followerAvatar, { zIndex: 3 }]}>
                <Ionicons name="person" size={12} color={COLORS.mediumGray} />
              </View>
              <View style={[styles.followerAvatar, { zIndex: 2, marginLeft: -8 }]}>
                <Ionicons name="person" size={12} color={COLORS.mediumGray} />
              </View>
            </View>
            <Text style={styles.followersText}>6 followers</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => navigation.navigate('EditProfile')}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>Edit profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
              <Text style={styles.shareButtonText}>Share profile</Text>
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
              Threads
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'replies' && styles.tabActive]}
            onPress={() => setActiveTab('replies')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'replies' && styles.tabTextActive]}>
              Replies
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'media' && styles.tabActive]}
            onPress={() => setActiveTab('media')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'media' && styles.tabTextActive]}>
              Media
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reposts' && styles.tabActive]}
            onPress={() => setActiveTab('reposts')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'reposts' && styles.tabTextActive]}>
              Reposts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Finish Profile Section */}
        <View style={styles.finishProfile}>
          <View style={styles.finishHeader}>
            <Text style={styles.finishTitle}>Finish your profile</Text>
            <Text style={styles.finishCount}>3 left</Text>
          </View>

          {/* Quick Action Cards */}
          <View style={styles.quickActions}>
            {/* Create Thread Card */}
            <View style={styles.actionCard}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="create-outline" size={32} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionCardTitle}>Create thread</Text>
              <Text style={styles.actionCardDesc}>
                Say what's on your mind or share a recent highlight.
              </Text>
              <TouchableOpacity style={styles.actionCardButton} activeOpacity={0.8}>
                <Text style={styles.actionCardButtonText}>Create</Text>
              </TouchableOpacity>
            </View>

            {/* Follow Profiles Card */}
            <View style={styles.actionCard}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="people-outline" size={32} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionCardTitle}>Follow 10 profiles</Text>
              <Text style={styles.actionCardDesc}>
                Fill your feed with threads that interest you.
              </Text>
              <TouchableOpacity style={styles.actionCardButton} activeOpacity={0.8}>
                <Text style={styles.actionCardButtonText}>See profiles</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
          <Ionicons name="heart-outline" size={26} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          activeOpacity={0.6}
        >
          <Ionicons name="person" size={26} color={COLORS.secondary} />
        </TouchableOpacity>
      </View>
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
  // Add Interests
  addInterests: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  addInterestsText: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  // Followers
  followersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  followerAvatars: {
    flexDirection: 'row',
  },
  followerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  followersText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
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
  editButtonText: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  shareButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    alignItems: 'center',
  },
  shareButtonText: {
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
});

export default ProfileScreen;
