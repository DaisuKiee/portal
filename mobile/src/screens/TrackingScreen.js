import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Share,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { trackingAPI, notificationAPI } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TrackingScreen = ({ navigation, route }) => {
  const { trackingCode: initialCode } = route.params || {};
  
  const [trackingCode, setTrackingCode] = useState(initialCode || '');
  const [searchCode, setSearchCode] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const drawerAnim = useRef(new Animated.Value(-SCREEN_WIDTH * 0.75)).current;

  useEffect(() => {
    loadUserData();
    loadUnreadCount();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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

  const handleCopyCode = async () => {
    try {
      Toast.show({
        type: 'success',
        text1: 'Copied!',
        text2: `Tracking code ${trackingCode} copied to clipboard`,
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `My CTU Daanbantayan Campus admission tracking code is: ${trackingCode}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleLookup = async () => {
    const codeToSearch = searchCode.trim() || trackingCode;
    if (!codeToSearch) {
      Toast.show({
        type: 'warning',
        text1: 'Error',
        text2: 'Please enter a tracking code',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await trackingAPI.lookup(codeToSearch);
      setLookupResult(response.data);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to find application';
      Toast.show({
        type: 'error',
        text1: 'Not Found',
        text2: message,
        position: 'top',
        topOffset: 60,
      });
      setLookupResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Toast.show({
      type: 'confirm',
      text1: 'Logout',
      text2: 'Are you sure you want to logout?',
      position: 'top',
      topOffset: 60,
      visibilityTime: 6000,
      props: {
        onConfirm: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
        onCancel: () => {},
        confirmText: 'Logout',
      },
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'reviewing': return COLORS.info;
      case 'accepted': return COLORS.success;
      case 'rejected': return COLORS.error;
      default: return COLORS.mediumGray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'reviewing': return 'search-outline';
      case 'accepted': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      default: return 'document-text-outline';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={toggleDrawer}
          activeOpacity={0.7}
        >
          <Ionicons name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Application</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Section - Only shown on first visit */}
        {initialCode && (
          <Animated.View 
            style={[
              styles.successSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.success} />
            </View>
            <Text style={styles.successTitle}>Application Submitted!</Text>
            <Text style={styles.successSubtext}>
              Your application has been submitted successfully. Please save your tracking code below.
            </Text>
          </Animated.View>
        )}

        {/* Tracking Code Card */}
        {trackingCode && (
          <Animated.View 
            style={[
              styles.codeCard,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }],
              },
            ]}
          >
            <Text style={styles.codeLabel}>YOUR TRACKING CODE</Text>
            <Text style={styles.codeValue}>{trackingCode}</Text>
            <Text style={styles.codeHint}>
              Use this code to check your application status
            </Text>
            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
                <Ionicons name="copy-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.copyBtnText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShareCode}>
                <Ionicons name="share-social-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Status Lookup Section */}
        <Animated.View 
          style={[
            styles.lookupCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="search" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.lookupTitle}>Check Application Status</Text>
          </View>
          <Text style={styles.lookupDesc}>
            Enter your tracking code to check the status of your application.
          </Text>
          <View style={styles.lookupRow}>
            <TextInput
              style={styles.lookupInput}
              placeholder="Enter tracking code"
              placeholderTextColor={COLORS.mediumGray}
              value={searchCode || trackingCode}
              onChangeText={setSearchCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.lookupBtn}
              onPress={handleLookup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Text style={styles.lookupBtnText}>Check</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Lookup Result */}
        {lookupResult && (
          <Animated.View 
            style={[
              styles.resultCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <Ionicons name={getStatusIcon(lookupResult.status)} size={28} color={getStatusColor(lookupResult.status)} />
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(lookupResult.status) + '20' },
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: getStatusColor(lookupResult.status) },
                ]}>
                  {lookupResult.status?.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.resultBody}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tracking Code</Text>
                <Text style={styles.resultValue}>{lookupResult.trackingCode}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Applicant</Text>
                <Text style={styles.resultValue}>{lookupResult.applicantName}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Course</Text>
                <Text style={styles.resultValue}>{lookupResult.course}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Submitted</Text>
                <Text style={styles.resultValue}>
                  {lookupResult.submittedAt
                    ? new Date(lookupResult.submittedAt).toLocaleDateString('en-PH', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })
                    : 'N/A'}
                </Text>
              </View>
            </View>

            {/* Status Timeline */}
            <View style={styles.timeline}>
              {['pending', 'reviewing', 'accepted'].map((step, index) => {
                const statusOrder = ['pending', 'reviewing', 'accepted'];
                const currentIndex = statusOrder.indexOf(lookupResult.status);
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <View key={step} style={styles.timelineStep}>
                    <View style={[
                      styles.timelineDot,
                      isCompleted && styles.timelineDotCompleted,
                      isCurrent && styles.timelineDotCurrent,
                    ]}>
                      {isCompleted && <Text style={styles.timelineCheck}>✓</Text>}
                    </View>
                    {index < 2 && (
                      <View style={[
                        styles.timelineLine,
                        isCompleted && index < currentIndex && styles.timelineLineCompleted,
                      ]} />
                    )}
                    <Text style={[
                      styles.timelineLabel,
                      isCompleted && styles.timelineLabelCompleted,
                    ]}>
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Info Card */}
        <Animated.View 
          style={[
            styles.infoCard,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Ionicons name="call-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.infoTitle}>Need Help?</Text>
          </View>
          <Text style={styles.infoText}>
            If you have questions about your application, contact the CTU Daanbantayan Campus Registrar's Office.
          </Text>
          <Text style={styles.infoContact}>
            Email: registrar@ctu.edu.ph{'\n'}
            Phone: (032) XXX-XXXX
          </Text>
        </Animated.View>

        {/* Community Feed Button */}
        <Animated.View 
          style={[
            styles.feedButtonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.feedButton}
            onPress={() => navigation.navigate('Feed', { trackingCode })}
            activeOpacity={0.8}
          >
            <View style={styles.feedButtonContent}>
              <Ionicons name="chatbubbles" size={24} color={COLORS.white} />
              <View style={styles.feedButtonText}>
                <Text style={styles.feedButtonTitle}>Community Feed</Text>
                <Text style={styles.feedButtonSubtitle}>
                  Join discussions and get updates
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </Animated.View>
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
                    setTimeout(() => navigation.navigate('Feed', { trackingCode }), 300);
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
  },
  header: {
    backgroundColor: COLORS.secondary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: SIZES.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.md,
    paddingBottom: SIZES.xxl,
  },
  successSection: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 24,
    color: COLORS.success,
    ...FONTS.bold,
    marginBottom: 6,
  },
  successSubtext: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SIZES.md,
  },
  codeCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.lg,
    ...SHADOWS.medium,
    alignItems: 'center',
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  codeLabel: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.bold,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  codeValue: {
    fontSize: 28,
    color: COLORS.primary,
    ...FONTS.bold,
    letterSpacing: 2,
    marginBottom: 4,
  },
  codeHint: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginBottom: 14,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: SIZES.borderRadiusSm,
  },
  copyBtnText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: SIZES.borderRadiusSm,
  },
  shareBtnText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  lookupCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    ...SHADOWS.small,
    marginBottom: SIZES.md,
  },
  lookupTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  lookupDesc: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginBottom: 12,
  },
  lookupRow: {
    flexDirection: 'row',
    gap: 8,
  },
  lookupInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    height: SIZES.inputHeight,
    fontSize: 15,
    color: COLORS.black,
    ...FONTS.medium,
  },
  lookupBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    paddingHorizontal: 20,
    height: SIZES.inputHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lookupBtnText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.bold,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    ...SHADOWS.medium,
    marginBottom: SIZES.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    ...FONTS.bold,
    letterSpacing: 0.5,
  },
  resultBody: {},
  resultRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ultraLightGray,
  },
  resultLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.medium,
  },
  resultValue: {
    flex: 1.5,
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  timelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineDotCurrent: {
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.primary + '40',
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  timelineCheck: {
    fontSize: 12,
    color: COLORS.white,
    ...FONTS.bold,
  },
  timelineLine: {
    position: 'absolute',
    right: -20,
    top: 11,
    width: 40,
    height: 2,
    backgroundColor: COLORS.lightGray,
  },
  timelineLineCompleted: {
    backgroundColor: COLORS.success,
  },
  timelineLabel: {
    fontSize: 10,
    color: COLORS.mediumGray,
    ...FONTS.medium,
    marginTop: 4,
  },
  timelineLabelCompleted: {
    color: COLORS.success,
    ...FONTS.semiBold,
  },
  infoCard: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '15',
  },
  infoTitle: {
    fontSize: 15,
    color: COLORS.primary,
    ...FONTS.bold,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.darkGray,
    ...FONTS.regular,
    lineHeight: 18,
    marginBottom: 8,
  },
  infoContact: {
    fontSize: 13,
    color: COLORS.primary,
    ...FONTS.medium,
    lineHeight: 20,
  },
  feedButtonContainer: {
    marginTop: SIZES.md,
  },
  feedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    ...SHADOWS.large,
  },
  feedButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  feedButtonText: {
    flex: 1,
  },
  feedButtonTitle: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: 2,
  },
  feedButtonSubtitle: {
    fontSize: 12,
    color: COLORS.white + 'DD',
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

export default TrackingScreen;
