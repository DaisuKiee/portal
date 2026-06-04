import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../styles/theme';
import { profileAPI } from '../services/api';
import moment from 'moment';

const ActiveSessionsScreen = ({ navigation }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [terminating, setTerminating] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await profileAPI.getSessions();
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Load sessions error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load sessions',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  const handleTerminateSession = (sessionId) => {
    Alert.alert(
      'Terminate Session',
      'Are you sure you want to terminate this session? The device will be logged out.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Terminate',
          style: 'destructive',
          onPress: () => terminateSession(sessionId),
        },
      ]
    );
  };

  const terminateSession = async (sessionId) => {
    try {
      setTerminating(sessionId);
      await profileAPI.terminateSession(sessionId);
      
      Toast.show({
        type: 'success',
        text1: 'Session Terminated',
        text2: 'The session has been terminated successfully',
        position: 'top',
        topOffset: 60,
      });

      // Reload sessions
      loadSessions();
    } catch (error) {
      console.error('Terminate session error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to terminate session',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setTerminating(null);
    }
  };

  const handleTerminateAllOthers = () => {
    Alert.alert(
      'Terminate All Other Sessions',
      'Are you sure you want to terminate all other sessions? All other devices will be logged out.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Terminate All',
          style: 'destructive',
          onPress: terminateAllOthers,
        },
      ]
    );
  };

  const terminateAllOthers = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.terminateAllSessions();
      
      Toast.show({
        type: 'success',
        text1: 'Sessions Terminated',
        text2: `${response.data.count} session(s) terminated successfully`,
        position: 'top',
        topOffset: 60,
      });

      // Reload sessions
      loadSessions();
    } catch (error) {
      console.error('Terminate all sessions error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to terminate sessions',
        position: 'top',
        topOffset: 60,
      });
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return 'phone-portrait';
      case 'tablet':
        return 'tablet-portrait';
      case 'desktop':
        return 'desktop';
      default:
        return 'help-circle';
    }
  };

  const getDeviceColor = (deviceType) => {
    switch (deviceType) {
      case 'mobile':
        return COLORS.primary;
      case 'tablet':
        return COLORS.secondary;
      case 'desktop':
        return COLORS.success;
      default:
        return COLORS.mediumGray;
    }
  };

  const isCurrentSession = (session, index) => {
    // The most recent session is likely the current one
    return index === 0;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Active Sessions</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Sessions</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          <Text style={styles.infoBannerText}>
            These are the devices currently logged into your account. If you see a device you don't recognize, terminate it immediately.
          </Text>
        </View>

        {/* Terminate All Button */}
        {sessions.length > 1 && (
          <TouchableOpacity
            style={styles.terminateAllButton}
            onPress={handleTerminateAllOthers}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out" size={20} color={COLORS.error} />
            <Text style={styles.terminateAllButtonText}>Terminate All Other Sessions</Text>
          </TouchableOpacity>
        )}

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="desktop-outline" size={64} color={COLORS.lightGray} />
            <Text style={styles.emptyText}>No active sessions</Text>
            <Text style={styles.emptySubtext}>You'll see your active sessions here</Text>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {sessions.map((session, index) => (
              <View key={session._id} style={styles.sessionCard}>
                {/* Device Icon */}
                <View
                  style={[
                    styles.deviceIconContainer,
                    { backgroundColor: getDeviceColor(session.deviceInfo.type) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getDeviceIcon(session.deviceInfo.type)}
                    size={32}
                    color={getDeviceColor(session.deviceInfo.type)}
                  />
                </View>

                {/* Session Info */}
                <View style={styles.sessionInfo}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionDevice}>
                      {session.deviceInfo.os} - {session.deviceInfo.browser}
                    </Text>
                    {isCurrentSession(session, index) && (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.sessionDetail}>
                    <Ionicons name="location" size={14} color={COLORS.mediumGray} />
                    <Text style={styles.sessionDetailText}>
                      {session.location.city}, {session.location.country}
                    </Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Ionicons name="globe" size={14} color={COLORS.mediumGray} />
                    <Text style={styles.sessionDetailText}>{session.location.ip}</Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Ionicons name="time" size={14} color={COLORS.mediumGray} />
                    <Text style={styles.sessionDetailText}>
                      Logged in {moment(session.loginTime).fromNow()}
                    </Text>
                  </View>

                  <View style={styles.sessionDetail}>
                    <Ionicons name="pulse" size={14} color={COLORS.mediumGray} />
                    <Text style={styles.sessionDetailText}>
                      Last active {moment(session.lastActivity).fromNow()}
                    </Text>
                  </View>

                  {/* Terminate Button */}
                  {!isCurrentSession(session, index) && (
                    <TouchableOpacity
                      style={styles.terminateButton}
                      onPress={() => handleTerminateSession(session._id)}
                      disabled={terminating === session._id}
                      activeOpacity={0.7}
                    >
                      {terminating === session._id ? (
                        <ActivityIndicator size="small" color={COLORS.error} />
                      ) : (
                        <>
                          <Ionicons name="log-out" size={16} color={COLORS.error} />
                          <Text style={styles.terminateButtonText}>Terminate</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Security Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Security Tip</Text>
            <Text style={styles.tipText}>
              Regularly review your active sessions and terminate any you don't recognize. Always log out from shared or public devices.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    lineHeight: 20,
  },
  terminateAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '10',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    gap: 8,
  },
  terminateAllButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.error,
  },
  sessionsList: {
    padding: 16,
    gap: 16,
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
    gap: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sessionDevice: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
    flex: 1,
  },
  currentBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sessionDetailText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.mediumGray,
  },
  terminateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.error + '10',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  terminateButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.mediumGray,
    marginTop: 8,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.success + '10',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.secondary,
    lineHeight: 20,
  },
});

export default ActiveSessionsScreen;
