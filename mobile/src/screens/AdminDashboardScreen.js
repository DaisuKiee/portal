import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import { adminAPI, feedAPI } from '../services/api';

const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalUsers: 0,
    verifiedUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load Stats',
        text2: error.response?.data?.message || 'Please try again',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Empty Post',
        text2: 'Please enter some content',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setSubmittingPost(true);
    try {
      await feedAPI.createPost(postContent.trim());
      Toast.show({
        type: 'success',
        text1: 'Post Created',
        text2: 'Your announcement has been pinned to the feed',
        position: 'top',
        topOffset: 60,
      });
      setPostContent('');
    } catch (error) {
      console.error('Create post error:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Create Post',
        text2: error.response?.data?.message || 'Please try again',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setSubmittingPost(false);
    }
  };

  const StatCard = ({ icon, title, value, color, onPress }) => (
    <TouchableOpacity 
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
    </TouchableOpacity>
  );

  const MenuButton = ({ icon, title, color, onPress }) => (
    <TouchableOpacity 
      style={styles.menuButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.menuButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>CTU Admission Portal</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Create Post Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="megaphone" size={18} color={COLORS.secondary} /> Create Announcement
          </Text>
          
          <View style={styles.createPostCard}>
            <View style={styles.createPostHeader}>
              <Ionicons name="pin" size={20} color={COLORS.primary} />
              <Text style={styles.createPostHeaderText}>
                Your post will be pinned to the top of the feed
              </Text>
            </View>
            
            <TextInput
              style={styles.postInput}
              placeholder="Write an announcement for students..."
              placeholderTextColor={COLORS.mediumGray}
              value={postContent}
              onChangeText={setPostContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
            />
            
            <View style={styles.postFooter}>
              <Text style={styles.charCount}>
                {postContent.length}/1000
              </Text>
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (!postContent.trim() || submittingPost) && styles.postButtonDisabled
                ]}
                onPress={handleCreatePost}
                disabled={!postContent.trim() || submittingPost}
                activeOpacity={0.8}
              >
                {submittingPost ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color={COLORS.white} />
                    <Text style={styles.postButtonText}>Post</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="stats-chart" size={18} color={COLORS.secondary} /> Overview
          </Text>
          
          <StatCard
            icon="document-text"
            title="Total Applications"
            value={stats.totalApplications}
            color={COLORS.primary}
            onPress={() => navigation.navigate('AdminApplications', { filter: 'all' })}
          />
          
          <StatCard
            icon="time"
            title="Pending Review"
            value={stats.pendingApplications}
            color="#FF9800"
            onPress={() => navigation.navigate('AdminApplications', { filter: 'pending' })}
          />
          
          <StatCard
            icon="checkmark-circle"
            title="Approved"
            value={stats.approvedApplications}
            color="#4CAF50"
            onPress={() => navigation.navigate('AdminApplications', { filter: 'approved' })}
          />
          
          <StatCard
            icon="close-circle"
            title="Rejected"
            value={stats.rejectedApplications}
            color="#F44336"
            onPress={() => navigation.navigate('AdminApplications', { filter: 'rejected' })}
          />
          
          <StatCard
            icon="people"
            title="Total Users"
            value={stats.totalUsers}
            color="#2196F3"
            onPress={() => navigation.navigate('AdminUsers')}
          />
          
          <StatCard
            icon="shield-checkmark"
            title="Verified Users"
            value={stats.verifiedUsers}
            color="#9C27B0"
            onPress={() => navigation.navigate('AdminUsers', { filter: 'verified' })}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="flash" size={18} color={COLORS.secondary} /> Quick Actions
          </Text>
          
          <View style={styles.menuGrid}>
            <MenuButton
              icon="document-text"
              title="Applications"
              color={COLORS.primary}
              onPress={() => navigation.navigate('AdminApplications')}
            />
            <MenuButton
              icon="people"
              title="Users"
              color="#2196F3"
              onPress={() => navigation.navigate('AdminUsers')}
            />
            <MenuButton
              icon="school"
              title="Courses"
              color="#4CAF50"
              onPress={() => navigation.navigate('AdminCourses')}
            />
            <MenuButton
              icon="newspaper"
              title="Feed Posts"
              color="#FF9800"
              onPress={() => navigation.navigate('AdminPosts')}
            />
            <MenuButton
              icon="notifications"
              title="Send Notice"
              color="#9C27B0"
              onPress={() => navigation.navigate('AdminNotifications')}
            />
            <MenuButton
              icon="settings"
              title="Settings"
              color="#607D8B"
              onPress={() => navigation.navigate('AdminSettings')}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  loadingText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.medium,
    marginTop: 12,
  },
  header: {
    backgroundColor: COLORS.secondary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SIZES.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    color: COLORS.white,
    ...FONTS.bold,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
    marginTop: 2,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.medium,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuButtonText: {
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    textAlign: 'center',
  },
  // Create Post Section
  createPostCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  createPostHeaderText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    ...FONTS.medium,
  },
  postInput: {
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.regular,
    minHeight: 100,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  postButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
});

export default AdminDashboardScreen;
