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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import { adminAPI } from '../services/api';

const AdminUsersScreen = ({ navigation, route }) => {
  const filter = route.params?.filter || 'all';
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filter]);

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getUsers(filter);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: 'Could not load users',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.fullName.toLowerCase().includes(text.toLowerCase()) ||
        user.email.toLowerCase().includes(text.toLowerCase()) ||
        user.role.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredUsers(users);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers().then(() => {
      if (searchQuery.trim() !== '') {
        handleSearch(searchQuery);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Users</Text>
          <Text style={styles.headerSubtitle}>
            {filter === 'all' ? 'All Users' : 'Verified Users'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.mediumGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or role..."
            placeholderTextColor={COLORS.mediumGray}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.mediumGray} />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery !== '' && (
          <Text style={styles.searchResultText}>
            {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''} found
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {filteredUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>
              {searchQuery !== '' ? 'No matching users found' : 'No users found'}
            </Text>
            {searchQuery !== '' && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user._id} style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{user.fullName}</Text>
                    {user.isVerified && (
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    )}
                  </View>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  <View style={styles.userMeta}>
                    <View style={[styles.roleBadge, user.role === 'admin' && styles.adminBadge]}>
                      <Text style={styles.roleText}>{user.role}</Text>
                    </View>
                    <Text style={styles.joinDate}>
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
    marginTop: 2,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchResultText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.medium,
    marginTop: 8,
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  clearSearchText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    ...FONTS.medium,
    marginTop: 16,
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    color: COLORS.white,
    ...FONTS.bold,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.primary + '20',
  },
  adminBadge: {
    backgroundColor: '#F44336' + '20',
  },
  roleText: {
    fontSize: 11,
    color: COLORS.primary,
    ...FONTS.bold,
    textTransform: 'uppercase',
  },
  joinDate: {
    fontSize: 11,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
});

export default AdminUsersScreen;
