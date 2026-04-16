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
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadUserData();
    loadUnreadCount();
    
    if (initialCode) {
      handleLookup();
    }
    
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
      // Silently fail
      setUnreadCount(0);
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
        type: 'error',
        text1: 'Missing Code',
        text2: 'Please enter a tracking code',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await trackingAPI.lookup(codeToSearch);
      setApplication(response.data);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Not Found',
        text2: error.response?.data?.message || 'Application not found',
        position: 'top',
        topOffset: 60,
      });
      setApplication(null);
    } finally {
      setLoading(false);
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

  const ProcessStage = ({ title, status, details }) => {
    const getIcon = () => {
      if (status === 'completed') return 'checkmark-circle';
      return 'ellipsis-horizontal-circle';
    };

    const getColor = () => {
      if (status === 'completed') return '#4CAF50';
      return '#9E9E9E';
    };

    return (
      <View style={styles.stageContainer}>
        <View style={styles.stageHeader}>
          <View style={styles.stageLeft}>
            <Ionicons name={getIcon()} size={28} color={getColor()} />
            <Text style={styles.stageTitle}>{title}</Text>
          </View>
          {status === 'completed' && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>
        {details && details.length > 0 && (
          <View style={styles.stageDetails}>
            {details.map((detail, index) => (
              <View key={index} style={styles.detailBox}>
                <Ionicons name="information-circle" size={16} color={COLORS.white} />
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Track Application</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Banner - Only shown on first visit */}
        {initialCode && !application && (
          <Animated.View 
            style={[
              styles.successBanner,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark-circle" size={40} color={COLORS.success} />
            </View>
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>Application Submitted!</Text>
              <Text style={styles.successSubtext}>
                Your application has been submitted successfully
              </Text>
            </View>
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
            <View style={styles.codeHeader}>
              <Ionicons name="barcode-outline" size={24} color={COLORS.primary} />
              <Text style={styles.codeLabel}>YOUR TRACKING CODE</Text>
            </View>
            <View style={styles.codeValueContainer}>
              <Text style={styles.codeValue}>{trackingCode}</Text>
            </View>
            <Text style={styles.codeHint}>
              Save this code to track your application status anytime
            </Text>
            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
                <Ionicons name="copy-outline" size={18} color={COLORS.white} />
                <Text style={styles.copyBtnText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShareCode}>
                <Ionicons name="share-social-outline" size={18} color={COLORS.white} />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Search Card */}
        <Animated.View 
          style={[
            styles.searchCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.searchHeader}>
            <Ionicons name="search" size={22} color={COLORS.primary} />
            <Text style={styles.searchTitle}>Check Application Status</Text>
          </View>
          <Text style={styles.searchSubtitle}>
            Enter your tracking code to view real-time updates on your application
          </Text>
          
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter tracking code"
              placeholderTextColor={COLORS.mediumGray}
              value={searchCode || trackingCode}
              onChangeText={setSearchCode}
              autoCapitalize="characters"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleLookup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <Ionicons name="search" size={20} color={COLORS.white} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Application Result - Admission Process */}
        {application && (
          <Animated.View 
            style={[
              styles.processCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.processHeader}>
              <Ionicons name="school" size={24} color={COLORS.white} />
              <Text style={styles.processTitle}>Admission Process</Text>
            </View>

            {/* View Details Button */}
            <TouchableOpacity 
              style={styles.viewDetailsButton}
              onPress={() => navigation.navigate('ApplicationDetails', { trackingCode: application.trackingCode })}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text" size={20} color={COLORS.primary} />
              <Text style={styles.viewDetailsText}>View Full Application Details</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>

            <ProcessStage
              title="Application"
              status={application.stages?.application || 'completed'}
              details={[]}
            />

            <ProcessStage
              title="Screening"
              status={application.stages?.screening || 'pending'}
              details={[]}
            />

            <ProcessStage
              title="Entrance Examination"
              status={application.stages?.exam || 'pending'}
              details={application.examDetails || []}
            />

            <ProcessStage
              title="Interview"
              status={application.stages?.interview || 'pending'}
              details={application.interviewDetails || []}
            />

            <ProcessStage
              title="Enrollment Selection"
              status={application.stages?.enrollment || 'pending'}
              details={application.enrollmentDetails || []}
            />

            <ProcessStage
              title="ID & Email Issuance"
              status={application.stages?.idIssuance || 'pending'}
              details={application.idDetails || []}
            />
          </Animated.View>
        )}

        {/* Disqualification Reasons */}
        {application && application.disqualificationReasons && application.disqualificationReasons.length > 0 && (
          <Animated.View 
            style={[
              styles.disqualificationCard,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.disqualificationHeader}>
              <Ionicons name="alert-circle" size={24} color="#D32F2F" />
              <Text style={styles.disqualificationTitle}>Important Notice</Text>
            </View>
            {application.disqualificationReasons.map((reason, index) => (
              <View key={index} style={styles.disqualificationItem}>
                <Ionicons name="close-circle" size={16} color="#D32F2F" />
                <Text style={styles.disqualificationText}>{reason}</Text>
              </View>
            ))}
          </Animated.View>
        )}

        {/* Help Card */}
        <Animated.View 
          style={[
            styles.helpCard,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={styles.helpHeader}>
            <Ionicons name="help-circle" size={22} color={COLORS.primary} />
            <Text style={styles.helpTitle}>Need Assistance?</Text>
          </View>
          <Text style={styles.helpText}>
            For questions about your application, contact the CTU Daanbantayan Campus Registrar's Office
          </Text>
          <View style={styles.helpContact}>
            <View style={styles.helpContactItem}>
              <Ionicons name="mail" size={16} color={COLORS.primary} />
              <Text style={styles.helpContactText}>registrar@ctu.edu.ph</Text>
            </View>
            <View style={styles.helpContactItem}>
              <Ionicons name="call" size={16} color={COLORS.primary} />
              <Text style={styles.helpContactText}>(032) XXX-XXXX</Text>
            </View>
          </View>
        </Animated.View>
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
          activeOpacity={0.6}
        >
          <Ionicons name="search" size={26} color={COLORS.secondary} />
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
          {unreadCount > 0 && (
            <View style={styles.bottomNavBadge}>
              <Text style={styles.bottomNavBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
  },
  contentContainer: {
    padding: SIZES.md,
    paddingBottom: 40,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  successIconCircle: {
    marginRight: 12,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 16,
    color: COLORS.success,
    ...FONTS.bold,
    marginBottom: 4,
  },
  successSubtext: {
    fontSize: 13,
    color: COLORS.darkGray,
    ...FONTS.regular,
  },
  codeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.medium,
    borderWidth: 2,
    borderColor: COLORS.primary + '20',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  codeLabel: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.bold,
    letterSpacing: 1.5,
  },
  codeValueContainer: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
    borderStyle: 'dashed',
  },
  codeValue: {
    fontSize: 24,
    color: COLORS.primary,
    ...FONTS.bold,
    letterSpacing: 3,
    textAlign: 'center',
  },
  codeHint: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    textAlign: 'center',
    marginBottom: 16,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  copyBtnText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  shareBtnText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  searchTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  searchSubtitle: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    lineHeight: 19,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.medium,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  processHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    gap: 10,
  },
  processTitle: {
    fontSize: 18,
    color: COLORS.white,
    ...FONTS.bold,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  viewDetailsText: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.semiBold,
    flex: 1,
  },
  stageContainer: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
  },
  stageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  stageTitle: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    flex: 1,
  },
  completedBadge: {
    backgroundColor: '#4CAF50' + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 11,
    color: '#4CAF50',
    ...FONTS.bold,
  },
  stageDetails: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    gap: 8,
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.white,
    ...FONTS.medium,
    lineHeight: 19,
  },
  disqualificationCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  disqualificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  disqualificationTitle: {
    fontSize: 16,
    color: '#C62828',
    ...FONTS.bold,
  },
  disqualificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  disqualificationText: {
    flex: 1,
    fontSize: 13,
    color: '#D32F2F',
    ...FONTS.regular,
    lineHeight: 19,
  },
  helpCard: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + '20',
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  helpTitle: {
    fontSize: 15,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  helpText: {
    fontSize: 13,
    color: COLORS.darkGray,
    ...FONTS.regular,
    lineHeight: 19,
    marginBottom: 12,
  },
  helpContact: {
    gap: 8,
  },
  helpContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpContactText: {
    fontSize: 13,
    color: COLORS.primary,
    ...FONTS.medium,
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
    position: 'relative',
  },
  bottomNavItemCenter: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNavBadge: {
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
  },
  bottomNavBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    ...FONTS.bold,
  },
});

export default TrackingScreen;
