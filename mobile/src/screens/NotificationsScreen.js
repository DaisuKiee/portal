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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      
      {/* Header - Threads Style */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
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
          <Ionicons name="checkmark-done" size={24} color={COLORS.secondary} />
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
          activeOpacity={0.6}
        >
          <Ionicons name="heart" size={26} color={COLORS.secondary} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
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
    fontSize: 18,
    color: COLORS.secondary,
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

export default NotificationsScreen;
