import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES } from '../styles/theme';
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
    
    // Load unread count with error suppression
    const loadNotifications = async () => {
      try {
        if (notificationAPI && notificationAPI.getUnreadCount) {
          await loadUnreadCount();
        }
      } catch (err) {
        // Suppress all notification errors
      }
    };
    
    loadNotifications();
    
    // Poll for notifications every 30 seconds
    const interval = setInterval(() => {
      loadNotifications().catch(() => {
        // Suppress polling errors
      });
    }, 30000);
    
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
      if (response && response.data && typeof response.data.count === 'number') {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      // Silently fail - notification count is not critical
      setUnreadCount(0);
      return Promise.resolve(); // Resolve to prevent error propagation
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
      <View style={styles.postContainer}>
        {/* Pinned Badge */}
        {item.isPinned && (
          <View style={styles.pinnedBanner}>
            <Ionicons name="pin" size={14} color={COLORS.primary} />
            <Text style={styles.pinnedText}>Pinned by Admin</Text>
          </View>
        )}
        
        {/* Post Header - Threads Style */}
        <View style={styles.postHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.author.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View style={styles.postMain}>
            <View style={styles.postTopRow}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{item.author.name}</Text>
                {item.author.role && (
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{item.author.role}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
            
            <Text style={styles.postContent}>{item.content}</Text>
            
            {/* Attachments Display */}
            {item.attachments && item.attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                {item.attachments.map((attachment, index) => (
                  <View key={index} style={styles.attachmentItem}>
                    {attachment.type.startsWith('image/') ? (
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => {
                          // Open image in full screen (could implement image viewer)
                        }}
                      >
                        <Image
                          source={{ uri: attachment.data }}
                          style={styles.attachmentImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.attachmentFile}>
                        <View style={styles.attachmentFileIcon}>
                          <Ionicons
                            name={
                              attachment.type.startsWith('video/') ? 'videocam' :
                              attachment.type === 'application/pdf' ? 'document-text' :
                              attachment.type.includes('word') ? 'document' :
                              'document-attach'
                            }
                            size={24}
                            color={COLORS.primary}
                          />
                        </View>
                        <View style={styles.attachmentFileInfo}>
                          <Text style={styles.attachmentFileName} numberOfLines={1}>
                            {attachment.name}
                          </Text>
                          <Text style={styles.attachmentFileSize}>
                            {(attachment.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </View>
                        <TouchableOpacity style={styles.attachmentDownload}>
                          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
            
            {/* Action Buttons - Threads Style */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => toggleComments(item.id)}
                activeOpacity={0.6}
              >
                <Ionicons
                  name={isCommentsExpanded ? "chatbubble" : "chatbubble-outline"}
                  size={20}
                  color={COLORS.secondary}
                />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.6}>
                <Ionicons name="heart-outline" size={20} color={COLORS.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.6}>
                <Ionicons name="paper-plane-outline" size={20} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            
            {/* Comment Count */}
            {commentCount > 0 && (
              <TouchableOpacity
                onPress={() => toggleComments(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.commentCount}>
                  {commentCount} {commentCount === 1 ? 'reply' : 'replies'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Comments Section - Threads Style */}
        {isCommentsExpanded && (
          <View style={styles.commentsContainer}>
            {item.comments.map((comment) => (
              <View key={comment.id} style={styles.commentRow}>
                <View style={styles.commentAvatarContainer}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.author.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.commentMain}>
                  <View style={styles.commentTopRow}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            ))}

            {/* Add Comment Input - Threads Style */}
            <View style={styles.replyRow}>
              <View style={styles.replyAvatarContainer}>
                <View style={styles.replyAvatar}>
                  <Ionicons name="person" size={16} color={COLORS.primary} />
                </View>
              </View>
              
              <View style={styles.replyInputContainer}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Reply..."
                  placeholderTextColor={COLORS.mediumGray}
                  value={commentText[item.id] || ''}
                  onChangeText={(text) =>
                    setCommentText(prev => ({ ...prev, [item.id]: text }))
                  }
                  multiline
                  maxLength={500}
                />
                {commentText[item.id]?.trim() && (
                  <TouchableOpacity
                    style={styles.replyButton}
                    onPress={() => handleAddComment(item.id)}
                    disabled={submittingComment === item.id}
                    activeOpacity={0.7}
                  >
                    {submittingComment === item.id ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Ionicons name="arrow-up-circle" size={28} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        
        {/* Divider */}
        <View style={styles.postDivider} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
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
          <Ionicons name="menu" size={26} color={COLORS.secondary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>CTU Community</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.6}
        >
          <Ionicons name="notifications-outline" size={26} color={COLORS.secondary} />
          {unreadCount > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>

      {/* What's New Bar - Threads Style */}
      <TouchableOpacity
        style={styles.whatsNewBar}
        onPress={() => setShowCreatePost(true)}
        activeOpacity={0.7}
      >
        <View style={styles.whatsNewAvatar}>
          <Text style={styles.whatsNewAvatarText}>
            {userData?.fullName?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.whatsNewText}>What's new?</Text>
      </TouchableOpacity>

      {/* Welcome Banner */}
      {showWelcome && trackingCode && (
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeContent}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <View style={styles.welcomeText}>
              <Text style={styles.welcomeTitle}>Application Submitted!</Text>
              <Text style={styles.welcomeSubtitle}>
                Track your application with code: {trackingCode}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.welcomeClose}
            onPress={() => setShowWelcome(false)}
            activeOpacity={0.6}
          >
            <Ionicons name="close" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to start a conversation</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
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
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerHeaderTitle}>Feeds</Text>
              <TouchableOpacity onPress={toggleDrawer}>
                <Ionicons name="close" size={28} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Feed Options */}
            <View style={styles.feedOptions}>
              <TouchableOpacity style={styles.feedOption} activeOpacity={0.7}>
                <Text style={styles.feedOptionText}>For you</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.feedOption} activeOpacity={0.7}>
                <Text style={styles.feedOptionText}>Recent</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.feedOption} activeOpacity={0.7}>
                <Text style={styles.feedOptionText}>Saved posts</Text>
                <Ionicons name="bookmark-outline" size={18} color={COLORS.secondary} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>

            <View style={styles.drawerDivider} />

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
              <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
            </TouchableOpacity>

            <View style={styles.drawerMenu}>
              <View style={styles.drawerDivider} />

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
                <Text style={[styles.drawerItemText, { color: COLORS.error }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Create Post Modal - Threads Style */}
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
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setShowCreatePost(false)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                
                <Text style={styles.modalTitle}>New Post</Text>
                
                <TouchableOpacity
                  onPress={handleCreatePost}
                  disabled={!newPostContent.trim() || submittingPost}
                  activeOpacity={0.6}
                >
                  {submittingPost ? (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  ) : (
                    <Text
                      style={[
                        styles.modalPost,
                        !newPostContent.trim() && styles.modalPostDisabled,
                      ]}
                    >
                      Post
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.createPostContent}>
                <View style={styles.createPostHeader}>
                  <View style={styles.createPostAvatar}>
                    <Text style={styles.createPostAvatarText}>
                      {userData?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </View>
                  <Text style={styles.createPostName}>
                    {userData?.fullName || 'Student'}
                  </Text>
                </View>

                <TextInput
                  style={styles.createPostInput}
                  placeholder="Start a feed..."
                  placeholderTextColor={COLORS.mediumGray}
                  value={newPostContent}
                  onChangeText={setNewPostContent}
                  multiline
                  maxLength={1000}
                  autoFocus
                />

                {/* Media Attachment Icons - Threads Style */}
                <View style={styles.mediaAttachments}>
                  <TouchableOpacity style={styles.mediaButton} activeOpacity={0.6}>
                    <Ionicons name="image-outline" size={22} color={COLORS.mediumGray} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaButton} activeOpacity={0.6}>
                    <Ionicons name="videocam-outline" size={22} color={COLORS.mediumGray} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaButton} activeOpacity={0.6}>
                    <Ionicons name="musical-notes-outline" size={22} color={COLORS.mediumGray} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaButton} activeOpacity={0.6}>
                    <Ionicons name="bar-chart-outline" size={22} color={COLORS.mediumGray} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.mediaButton} activeOpacity={0.6}>
                    <Ionicons name="ellipsis-horizontal" size={22} color={COLORS.mediumGray} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.charCount}>
                  {newPostContent.length}/1000
                </Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Bottom Tab Navigation - Threads Style */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => {}}
          activeOpacity={0.6}
        >
          <Ionicons name="home" size={26} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate('Tracking', { trackingCode })}
          activeOpacity={0.6}
        >
          <Ionicons name="search-outline" size={26} color={COLORS.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItemCenter}
          onPress={() => setShowCreatePost(true)}
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
          {unreadCount > 0 && <View style={styles.bottomNavDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.6}
        >
          <Ionicons name="person-outline" size={26} color={COLORS.secondary} />
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  // Header - Threads Style
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
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  // What's New Bar - Threads Style
  whatsNewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
    gap: 12,
  },
  whatsNewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsNewAvatarText: {
    fontSize: 16,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  whatsNewText: {
    fontSize: 15,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  // Welcome Banner
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.success + '10',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.success + '30',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginTop: 2,
  },
  welcomeClose: {
    padding: 4,
  },
  // Feed List
  feedList: {
    paddingBottom: 80,
  },
  // Post Container - Threads Style
  postContainer: {
    backgroundColor: COLORS.white,
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.primary + '10',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  pinnedText: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  postHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  postMain: {
    flex: 1,
  },
  postTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  roleBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 11,
    color: COLORS.white,
    ...FONTS.bold,
  },
  timestamp: {
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  actionBtn: {
    padding: 4,
  },
  commentCount: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  // Attachments
  attachmentsContainer: {
    marginBottom: 12,
    gap: 8,
  },
  attachmentItem: {
    marginBottom: 8,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.ultraLightGray,
  },
  attachmentFile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    gap: 12,
  },
  attachmentFileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentFileInfo: {
    flex: 1,
  },
  attachmentFileName: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 2,
  },
  attachmentFileSize: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  attachmentDownload: {
    padding: 8,
  },
  // Comments - Threads Style
  commentsContainer: {
    paddingLeft: 48,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: COLORS.ultraLightGray + '50',
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  commentAvatarContainer: {
    marginRight: 10,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.mediumGray + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.bold,
  },
  commentMain: {
    flex: 1,
  },
  commentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  commentAuthor: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  commentTimestamp: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 18,
  },
  // Reply Input - Threads Style
  replyRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  replyAvatarContainer: {
    marginRight: 10,
  },
  replyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    maxHeight: 100,
  },
  replyButton: {
    marginBottom: 2,
  },
  postDivider: {
    height: 0.5,
    backgroundColor: COLORS.lightGray,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginTop: 4,
  },
  // Drawer
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
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  drawerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
    ...FONTS.semiBold,
  },
  drawerMenu: {
    flex: 1,
    paddingTop: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  drawerItemText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.medium,
  },
  drawerBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  drawerBadgeText: {
    fontSize: 11,
    color: COLORS.white,
    ...FONTS.bold,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: 8,
    marginHorizontal: 20,
  },
  // Drawer Header Icons - Threads Style
  drawerHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Feed Filters - Threads Style
  feedFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filterIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.ultraLightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Feed Options - Threads Style
  feedOptions: {
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  feedOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  feedOptionText: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.medium,
  },
  // Create Post Modal - Threads Style
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  createPostModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  modalCancel: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  modalTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  modalPost: {
    fontSize: 16,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  modalPostDisabled: {
    color: COLORS.mediumGray,
  },
  createPostContent: {
    padding: 16,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  createPostAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostAvatarText: {
    fontSize: 16,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  createPostName: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  createPostInput: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.regular,
    minHeight: 150,
    maxHeight: 400,
    textAlignVertical: 'top',
    paddingVertical: 0,
    marginBottom: 16,
  },
  // Media Attachments - Threads Style
  mediaAttachments: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  mediaButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.ultraLightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    textAlign: 'right',
    marginTop: 12,
  },
  // Bottom Tab Navigation - Threads Style
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingVertical: 8,
    paddingBottom: 20,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.lightGray,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bottomNavItemCenter: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.error,
  },
});

export default FeedScreen;
