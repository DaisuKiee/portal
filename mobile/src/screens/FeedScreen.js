import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { feedAPI, notificationAPI } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

const FeedScreen = ({ navigation, route }) => {
  const { trackingCode } = route.params || {};
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [submittingComment, setSubmittingComment] = useState(null);
  const [showWelcome, setShowWelcome] = useState(!!trackingCode);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [userData, setUserData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    loadPosts();
    loadUserData();
    loadUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        setUserData(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
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

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await feedAPI.getPosts();
      setPosts(response.data);
    } catch (error) {
      console.error('Error loading posts:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load posts',
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
    loadPosts();
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleAddComment = async (postId) => {
    const comment = commentText[postId]?.trim();
    if (!comment) {
      Toast.show({
        type: 'warning',
        text1: 'Empty Comment',
        text2: 'Please write something before posting',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    try {
      setSubmittingComment(postId);
      
      const response = await feedAPI.addComment(postId, comment);
      const newComment = response.data;

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );

      setCommentText(prev => ({ ...prev, [postId]: '' }));
      
      Toast.show({
        type: 'success',
        text1: 'Comment Posted',
        text2: 'Your comment has been added',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to post comment',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setSubmittingComment(null);
    }
  };

  const handleCreatePost = async () => {
    const content = newPostContent.trim();
    if (!content) {
      Toast.show({
        type: 'warning',
        text1: 'Empty Post',
        text2: 'Please write something before posting',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    try {
      setSubmittingPost(true);
      
      const response = await feedAPI.createPost(content);
      const newPost = response.data;

      setPosts(prevPosts => [newPost, ...prevPosts]);
      setNewPostContent('');
      setShowCreatePost(false);
      
      Toast.show({
        type: 'success',
        text1: 'Post Created',
        text2: 'Your post has been published',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to create post',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setSubmittingPost(false);
    }
  };

  const renderPost = ({ item }) => {
    const isCommentsExpanded = expandedComments[item.id];
    const commentCount = item.comments.length;

    return (
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.authorAvatar}>
            <Ionicons name="person" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.authorInfo}>
            <View style={styles.authorNameRow}>
              <Text style={styles.authorName}>{item.author.name}</Text>
              {item.author.role && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{item.author.role}</Text>
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
        </View>

        {/* Post Content */}
        <Text style={styles.postContent}>{item.content}</Text>

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => toggleComments(item.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isCommentsExpanded ? 'chatbubble' : 'chatbubble-outline'}
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.actionText}>
              {commentCount} {commentCount === 1 ? 'Comment' : 'Comments'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {isCommentsExpanded && (
          <View style={styles.commentsSection}>
            {/* Existing Comments */}
            {item.comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Ionicons name="person-circle" size={32} color={COLORS.mediumGray} />
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                  </View>
                  <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                </View>
              </View>
            ))}

            {/* Add Comment Input */}
            <View style={styles.addCommentContainer}>
              <View style={styles.commentInputAvatar}>
                <Ionicons name="person-circle" size={32} color={COLORS.primary} />
              </View>
              <View style={styles.commentInputWrapper}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  placeholderTextColor={COLORS.mediumGray}
                  value={commentText[item.id] || ''}
                  onChangeText={(text) =>
                    setCommentText(prev => ({ ...prev, [item.id]: text }))
                  }
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!commentText[item.id]?.trim() || submittingComment === item.id) &&
                      styles.sendButtonDisabled,
                  ]}
                  onPress={() => handleAddComment(item.id)}
                  disabled={!commentText[item.id]?.trim() || submittingComment === item.id}
                  activeOpacity={0.7}
                >
                  {submittingComment === item.id ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Ionicons name="send" size={18} color={COLORS.white} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleDrawer}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Feed</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications" size={24} color={COLORS.white} />
          {unreadCount > 0 && (
            <View style={styles.headerNotificationBadge}>
              <Text style={styles.headerNotificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Welcome Banner - shown after submission */}
      {showWelcome && trackingCode && (
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeContent}>
            <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>Welcome to CTU Community!</Text>
              <Text style={styles.welcomeSubtitle}>
                Your application has been submitted. Tracking code: {trackingCode}
              </Text>
            </View>
          </View>
          <View style={styles.welcomeActions}>
            <TouchableOpacity
              style={styles.trackingButton}
              onPress={() => navigation.navigate('Tracking', { trackingCode })}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={16} color={COLORS.primary} />
              <Text style={styles.trackingButtonText}>Track Application</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setShowWelcome(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color={COLORS.mediumGray} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Feed List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.feedList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Create Post Quick Access */}
            <View style={styles.createPostQuick}>
              <View style={styles.quickPostAvatar}>
                <Ionicons name="person" size={20} color={COLORS.primary} />
              </View>
              <TouchableOpacity
                style={styles.quickPostInput}
                onPress={() => setShowCreatePost(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickPostPlaceholder}>What's on your mind?</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickPostButton}
                onPress={() => setShowCreatePost(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="image-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            {/* Divider */}
            <View style={styles.feedDivider} />
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to post!</Text>
          </View>
        }
      />

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
                    setTimeout(() => navigation.navigate('Tracking', { trackingCode }), 300);
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
                setTimeout(() => navigation.navigate('Profile'), 300);
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
                    setTimeout(() => navigation.navigate('Tracking', { trackingCode }), 300);
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
                    setTimeout(() => navigation.navigate('Profile'), 300);
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

      {/* Create Post Modal */}
      <Modal
        visible={showCreatePost}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreatePost(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowCreatePost(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.createPostModal}
            >
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity
                  onPress={() => setShowCreatePost(false)}
                  style={styles.modalCloseButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={28} color={COLORS.mediumGray} />
                </TouchableOpacity>
              </View>

              {/* Post Input */}
              <View style={styles.createPostContent}>
                <View style={styles.postAuthorInfo}>
                  <View style={styles.postAuthorAvatar}>
                    <Ionicons name="person" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.postAuthorName}>
                    {userData?.fullName || 'Student'}
                  </Text>
                </View>

                <TextInput
                  style={styles.postInput}
                  placeholder="Ask a question about admissions..."
                  placeholderTextColor={COLORS.mediumGray}
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  multiline
                  maxLength={1000}
                  autoFocus
                />

                <Text style={styles.charCount}>
                  {newPostContent.length}/1000
                </Text>
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowCreatePost(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.postButton,
                    (!newPostContent.trim() || submittingPost) && styles.postButtonDisabled,
                  ]}
                  onPress={handleCreatePost}
                  disabled={!newPostContent.trim() || submittingPost}
                  activeOpacity={0.7}
                >
                  {submittingPost ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.postButtonText}>Post</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerNotificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  headerNotificationBadgeText: {
    fontSize: 9,
    color: COLORS.white,
    ...FONTS.bold,
  },
  welcomeBanner: {
    backgroundColor: COLORS.success + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.success + '30',
    padding: SIZES.md,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 16,
    color: COLORS.success,
    ...FONTS.bold,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 18,
  },
  welcomeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  trackingButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  dismissButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.ultraLightGray,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  feedList: {
    paddingBottom: 80,
  },
  createPostQuick: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    gap: 10,
    ...SHADOWS.small,
  },
  quickPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickPostInput: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  quickPostPlaceholder: {
    fontSize: 15,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  quickPostButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedDivider: {
    height: 8,
    backgroundColor: COLORS.ultraLightGray,
  },
  postCard: {
    backgroundColor: COLORS.white,
    marginBottom: 8,
    paddingTop: SIZES.md,
    ...SHADOWS.small,
  },
  postCard: {
    backgroundColor: '#242526',
    marginBottom: 8,
    paddingTop: SIZES.md,
  },
  postCard: {
    backgroundColor: COLORS.white,
    marginBottom: 8,
    paddingTop: SIZES.md,
    ...SHADOWS.small,
  },
  postHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: SIZES.md,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  roleBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleBadgeText: {
    fontSize: 10,
    color: COLORS.primary,
    ...FONTS.bold,
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  postContent: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 20,
    marginBottom: 12,
    paddingHorizontal: SIZES.md,
  },
  postActions: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: SIZES.md,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.semiBold,
  },
  commentsSection: {
    marginTop: 0,
    paddingTop: 12,
    paddingHorizontal: SIZES.md,
    backgroundColor: COLORS.ultraLightGray,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatar: {
    marginRight: 8,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 18,
    padding: 12,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 18,
  },
  commentTimestamp: {
    fontSize: 11,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginLeft: 12,
  },
  addCommentContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
  },
  commentInputAvatar: {
    marginRight: 8,
  },
  commentInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 40,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginTop: 4,
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
    width: DRAWER_WIDTH,
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
  drawerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerName: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: 4,
  },
  drawerEmail: {
    fontSize: 14,
    color: COLORS.white + 'DD',
    ...FONTS.regular,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  drawerItemText: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.medium,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 12,
    marginHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  createPostModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  modalCloseButton: {
    padding: 4,
  },
  createPostContent: {
    padding: 20,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  postAuthorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postAuthorName: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  postInput: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.regular,
    minHeight: 150,
    maxHeight: 300,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    textAlign: 'right',
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  cancelButtonText: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  postButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    minWidth: 80,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
    opacity: 0.5,
  },
  postButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.bold,
  },
});

export default FeedScreen;
