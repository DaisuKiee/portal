import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../styles/theme';
import { profileAPI } from '../services/api';
import moment from 'moment';

const LoginHistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [filter, setFilter] = useState(null); // null, 'login', 'logout', 'failed_login', '2fa_failed', 'session_terminated'

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async (page = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await profileAPI.getLoginHistory(page, 20, filter);
      
      if (page === 1) {
        setHistory(response.data.history);
      } else {
        setHistory([...history, ...response.data.history]);
      }
      
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Load history error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load login history',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory(1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && pagination.page < pagination.pages) {
      loadHistory(pagination.page + 1);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter === filter ? null : newFilter);
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'login':
        return 'log-in';
      case 'logout':
        return 'log-out';
      case 'failed_login':
        return 'close-circle';
      case '2fa_failed':
        return 'shield-half';
      case 'session_terminated':
        return 'power';
      default:
        return 'help-circle';
    }
  };

  const getActionColor = (action, success) => {
    if (!success) return COLORS.error;
    
    switch (action) {
      case 'login':
        return COLORS.success;
      case 'logout':
        return COLORS.secondary;
      case 'session_terminated':
        return COLORS.warning;
      default:
        return COLORS.mediumGray;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case 'login':
        return 'Login';
      case 'logout':
        return 'Logout';
      case 'failed_login':
        return 'Failed Login';
      case '2fa_failed':
        return '2FA Failed';
      case 'session_terminated':
        return 'Session Terminated';
      default:
        return 'Unknown';
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

  const renderHistoryItem = ({ item }) => {
    const actionColor = getActionColor(item.action, item.success);
    
    return (
      <View style={styles.historyCard}>
        {/* Action Icon */}
        <View style={[styles.actionIconContainer, { backgroundColor: actionColor + '20' }]}>
          <Ionicons name={getActionIcon(item.action)} size={24} color={actionColor} />
        </View>

        {/* History Info */}
        <View style={styles.historyInfo}>
          <View style={styles.historyHeader}>
            <Text style={styles.actionLabel}>{getActionLabel(item.action)}</Text>
            <Text style={styles.timestamp}>{moment(item.timestamp).fromNow()}</Text>
          </View>

          <View style={styles.historyDetail}>
            <Ionicons name={getDeviceIcon(item.deviceInfo.type)} size={14} color={COLORS.mediumGray} />
            <Text style={styles.historyDetailText}>
              {item.deviceInfo.os} - {item.deviceInfo.browser}
            </Text>
          </View>

          <View style={styles.historyDetail}>
            <Ionicons name="location" size={14} color={COLORS.mediumGray} />
            <Text style={styles.historyDetailText}>
              {item.location.city}, {item.location.country}
            </Text>
          </View>

          <View style={styles.historyDetail}>
            <Ionicons name="globe" size={14} color={COLORS.mediumGray} />
            <Text style={styles.historyDetailText}>{item.location.ip}</Text>
          </View>

          {item.failureReason && (
            <View style={styles.failureReasonContainer}>
              <Ionicons name="alert-circle" size={14} color={COLORS.error} />
              <Text style={styles.failureReasonText}>{item.failureReason}</Text>
            </View>
          )}

          {/* Status Badge */}
          <View style={styles.statusBadgeContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: item.success ? COLORS.success + '20' : COLORS.error + '20' },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: item.success ? COLORS.success : COLORS.error },
                ]}
              >
                {item.success ? 'Success' : 'Failed'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time-outline" size={64} color={COLORS.lightGray} />
        <Text style={styles.emptyText}>No login history</Text>
        <Text style={styles.emptySubtext}>
          {filter ? 'No records found for this filter' : 'Your login activity will appear here'}
        </Text>
      </View>
    );
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
          <Text style={styles.headerTitle}>Login History</Text>
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
        <Text style={styles.headerTitle}>Login History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterChip, filter === null && styles.filterChipActive]}
          onPress={() => handleFilterChange(null)}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === null && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'login' && styles.filterChipActive]}
          onPress={() => handleFilterChange('login')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'login' && styles.filterChipTextActive]}>
            Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'logout' && styles.filterChipActive]}
          onPress={() => handleFilterChange('logout')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'logout' && styles.filterChipTextActive]}>
            Logout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'failed_login' && styles.filterChipActive]}
          onPress={() => handleFilterChange('failed_login')}
          activeOpacity={0.7}
        >
          <Text
            style={[styles.filterChipText, filter === 'failed_login' && styles.filterChipTextActive]}
          >
            Failed
          </Text>
        </TouchableOpacity>
      </View>

      {/* History List */}
      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
      />
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.mediumGray,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    gap: 6,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.secondary,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.mediumGray,
  },
  historyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyDetailText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.mediumGray,
  },
  failureReasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    padding: 8,
    backgroundColor: COLORS.error + '10',
    borderRadius: 8,
  },
  failureReasonText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.error,
    flex: 1,
  },
  statusBadgeContainer: {
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
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
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default LoginHistoryScreen;
