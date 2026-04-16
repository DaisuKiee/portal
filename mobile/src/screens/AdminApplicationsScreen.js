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
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import { adminAPI } from '../services/api';

const AdminApplicationsScreen = ({ navigation, route }) => {
  const filter = route.params?.filter || 'all';
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadApplications();
  }, [filter]);

  const loadApplications = async () => {
    try {
      const response = await adminAPI.getApplications(filter);
      setApplications(response.data);
      setFilteredApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: 'Could not load applications',
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
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(app => 
        app.trackingCode.toLowerCase().includes(text.toLowerCase()) ||
        app.fullName.toLowerCase().includes(text.toLowerCase()) ||
        app.email.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredApplications(applications);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadApplications().then(() => {
      // Reapply search filter after refresh
      if (searchQuery.trim() !== '') {
        handleSearch(searchQuery);
      }
    });
  };

  const handleViewDetails = (app) => {
    setSelectedApp(app);
    setRemarks('');
    setModalVisible(true);
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedApp) return;

    setActionLoading(true);
    try {
      await adminAPI.updateApplicationStatus(selectedApp._id, {
        status,
        remarks: remarks.trim() || undefined,
      });

      Toast.show({
        type: 'success',
        text1: 'Status Updated',
        text2: `Application ${status}`,
        position: 'top',
        topOffset: 60,
      });

      setModalVisible(false);
      loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: error.response?.data?.message || 'Please try again',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'pending': return '#FF9800';
      default: return COLORS.mediumGray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      case 'pending': return 'time';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Applications...</Text>
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
          <Text style={styles.headerTitle}>Applications</Text>
          <Text style={styles.headerSubtitle}>
            {filter === 'all' ? 'All Applications' : 
             filter === 'pending' ? 'Pending Review' :
             filter === 'approved' ? 'Approved' : 'Rejected'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.mediumGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by tracking code, name, or email..."
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
            {filteredApplications.length} result{filteredApplications.length !== 1 ? 's' : ''} found
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
        {filteredApplications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>
              {searchQuery !== '' ? 'No matching applications found' : 'No applications found'}
            </Text>
            {searchQuery !== '' && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredApplications.map((app) => (
            <TouchableOpacity
              key={app._id}
              style={styles.appCard}
              onPress={() => handleViewDetails(app)}
              activeOpacity={0.7}
            >
              <View style={styles.appHeader}>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{app.fullName}</Text>
                  <Text style={styles.appCode}>{app.trackingCode}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(app.status) + '20' }]}>
                  <Ionicons name={getStatusIcon(app.status)} size={16} color={getStatusColor(app.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(app.status) }]}>
                    {app.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.appDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="school" size={14} color={COLORS.mediumGray} />
                  <Text style={styles.detailText}>{app.selectedCourse}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="mail" size={14} color={COLORS.mediumGray} />
                  <Text style={styles.detailText}>{app.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={14} color={COLORS.mediumGray} />
                  <Text style={styles.detailText}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Application Details</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedApp && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Tracking Code</Text>
                    <Text style={styles.modalValue}>{selectedApp.trackingCode}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Full Name</Text>
                    <Text style={styles.modalValue}>{selectedApp.fullName}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Email</Text>
                    <Text style={styles.modalValue}>{selectedApp.email}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Selected Course</Text>
                    <Text style={styles.modalValue}>{selectedApp.selectedCourse}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedApp.status) + '20' }]}>
                      <Ionicons name={getStatusIcon(selectedApp.status)} size={16} color={getStatusColor(selectedApp.status)} />
                      <Text style={[styles.statusText, { color: getStatusColor(selectedApp.status) }]}>
                        {selectedApp.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalLabel}>Remarks (Optional)</Text>
                    <TextInput
                      style={styles.remarksInput}
                      placeholder="Add remarks or feedback..."
                      placeholderTextColor={COLORS.mediumGray}
                      value={remarks}
                      onChangeText={setRemarks}
                      multiline
                      numberOfLines={3}
                      editable={!actionLoading}
                    />
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleUpdateStatus('approved')}
                      disabled={actionLoading || selectedApp.status === 'approved'}
                      activeOpacity={0.7}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color={COLORS.white} size="small" />
                      ) : (
                        <>
                          <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                          <Text style={styles.actionButtonText}>Approve</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleUpdateStatus('rejected')}
                      disabled={actionLoading || selectedApp.status === 'rejected'}
                      activeOpacity={0.7}
                    >
                      {actionLoading ? (
                        <ActivityIndicator color={COLORS.white} size="small" />
                      ) : (
                        <>
                          <Ionicons name="close-circle" size={20} color={COLORS.white} />
                          <Text style={styles.actionButtonText}>Reject</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Manage Tracking Button */}
                  <TouchableOpacity
                    style={styles.trackingButton}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('AdminTrackingManagement', { applicationId: selectedApp._id });
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="list" size={20} color={COLORS.primary} />
                    <Text style={styles.trackingButtonText}>Manage Tracking Stages</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  appCard: {
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
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  appCode: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    ...FONTS.semiBold,
    textTransform: 'capitalize',
  },
  appDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.darkGray,
    ...FONTS.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.ultraLightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.semiBold,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalValue: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  remarksInput: {
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.bold,
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 12,
    gap: 8,
  },
  trackingButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    ...FONTS.bold,
  },
});

export default AdminApplicationsScreen;
