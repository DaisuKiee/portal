import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { notificationAPI } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const drawerAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    loadNotifications();
    loadUserData();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
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

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      setNotifications(response.data);
      
      // Update unread count
      const unread = response.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load notifications',
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
    loadNotifications();
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      Toast.show({
        type: 'success',
        text1: 'All Marked as Read',
        text2: 'All notifications have been marked as read',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to mark all as read',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return { name: 'document-text', color: COLORS.primary };
      case 'comment':
        return { name: 'chatbubble', color: COLORS.info };
      case 'status':
        return { name: 'information-circle', color: COLORS.warning };
      default:
        return { name: 'notifications', color: COLORS.mediumGray };
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(date).toLocaleDateString();
  };

  const renderNotification = ({ item, index }) => {
    const icon = getNotificationIcon(item.type);
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 20],
                outputRange: [0, 20],
              }),
            },
          ],
        }}
      >
        <TouchableOpacity
          style={[
            styles.notificationCard,
            !item.read && styles.notificationUnread,
          ]}
          onPress={() => handleMarkAsRead(item._id)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: icon.color + '15' }]}>
            <Ionicons name={icon.name} size={24} color={icon.color} />
          </View>
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationMessage} numberOfLines={2}>
              {item.message}
            </Text>
            <View style={styles.notificationFooter}>
              <Ionicons name="time-outline" size={14} color={COLORS.mediumGray} />
              <Text style={styles.notificationTime}>{getTimeAgo(item.createdAt)}</Text>
            </View>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllAsRead}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-done" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
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
            <Ionicons name="notifications-off-outline" size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>You'll see notifications here when you have them</Text>
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
                    setTimeout(() => navigation.navigate('Tracking'), 300);
                  }}
                >
                  <Ionicons name="search-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.drawerHeaderIcon}
                  onPress={() => {
                    toggleDrawer();
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
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
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.white,
    ...FONTS.bold,
  },
  headerBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  headerBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    ...FONTS.bold,
  },
  markAllButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 4,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: SIZES.md,
    marginBottom: 2,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
    ...SHADOWS.small,
  },
  notificationUnread: {
    backgroundColor: COLORS.primary + '08',
    borderLeftColor: COLORS.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginLeft: 8,
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
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
    textAlign: 'center',
    paddingHorizontal: 40,
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

export default NotificationsScreen;
