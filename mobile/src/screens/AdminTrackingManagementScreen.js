import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import { adminAPI } from '../services/api';

const AdminTrackingManagementScreen = ({ navigation, route }) => {
  const { applicationId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [application, setApplication] = useState(null);
  
  // Stage statuses
  const [stages, setStages] = useState({
    application: 'completed',
    screening: 'pending',
    exam: 'pending',
    interview: 'pending',
    enrollment: 'pending',
    idIssuance: 'pending',
  });

  // Details for each stage
  const [examDetails, setExamDetails] = useState([]);
  const [interviewDetails, setInterviewDetails] = useState([]);
  const [enrollmentDetails, setEnrollmentDetails] = useState([]);
  const [idDetails, setIdDetails] = useState([]);
  const [disqualificationReasons, setDisqualificationReasons] = useState([]);

  // Input fields for adding new details
  const [newExamDetail, setNewExamDetail] = useState('');
  const [newInterviewDetail, setNewInterviewDetail] = useState('');
  const [newEnrollmentDetail, setNewEnrollmentDetail] = useState('');
  const [newIdDetail, setNewIdDetail] = useState('');
  const [newDisqualification, setNewDisqualification] = useState('');

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    screening: false,
    exam: false,
    interview: false,
    enrollment: false,
    idIssuance: false,
    disqualification: false,
  });

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      const response = await adminAPI.getApplications('all');
      const app = response.data.find(a => a._id === applicationId);
      
      if (app) {
        setApplication(app);
        setStages(app.stages || stages);
        setExamDetails(app.examDetails || []);
        setInterviewDetails(app.interviewDetails || []);
        setEnrollmentDetails(app.enrollmentDetails || []);
        setIdDetails(app.idDetails || []);
        setDisqualificationReasons(app.disqualificationReasons || []);
      }
    } catch (error) {
      console.error('Error loading application:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: 'Could not load application',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleStage = (stageName) => {
    setStages(prev => ({
      ...prev,
      [stageName]: prev[stageName] === 'completed' ? 'pending' : 'completed',
    }));
  };

  const addDetail = (type) => {
    let detail = '';
    let setter = null;
    let detailsSetter = null;
    let currentDetails = [];

    switch (type) {
      case 'exam':
        detail = newExamDetail.trim();
        setter = setNewExamDetail;
        detailsSetter = setExamDetails;
        currentDetails = examDetails;
        break;
      case 'interview':
        detail = newInterviewDetail.trim();
        setter = setNewInterviewDetail;
        detailsSetter = setInterviewDetails;
        currentDetails = interviewDetails;
        break;
      case 'enrollment':
        detail = newEnrollmentDetail.trim();
        setter = setNewEnrollmentDetail;
        detailsSetter = setEnrollmentDetails;
        currentDetails = enrollmentDetails;
        break;
      case 'id':
        detail = newIdDetail.trim();
        setter = setNewIdDetail;
        detailsSetter = setIdDetails;
        currentDetails = idDetails;
        break;
      case 'disqualification':
        detail = newDisqualification.trim();
        setter = setNewDisqualification;
        detailsSetter = setDisqualificationReasons;
        currentDetails = disqualificationReasons;
        break;
    }

    if (detail) {
      detailsSetter([...currentDetails, detail]);
      setter('');
    }
  };

  const removeDetail = (type, index) => {
    switch (type) {
      case 'exam':
        setExamDetails(prev => prev.filter((_, i) => i !== index));
        break;
      case 'interview':
        setInterviewDetails(prev => prev.filter((_, i) => i !== index));
        break;
      case 'enrollment':
        setEnrollmentDetails(prev => prev.filter((_, i) => i !== index));
        break;
      case 'id':
        setIdDetails(prev => prev.filter((_, i) => i !== index));
        break;
      case 'disqualification':
        setDisqualificationReasons(prev => prev.filter((_, i) => i !== index));
        break;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('Saving tracking stages for application:', applicationId);
      console.log('Stages:', stages);
      console.log('Exam Details:', examDetails);
      console.log('Interview Details:', interviewDetails);
      
      const response = await adminAPI.updateApplicationStages(applicationId, {
        stages,
        examDetails,
        interviewDetails,
        enrollmentDetails,
        idDetails,
        disqualificationReasons,
      });

      console.log('Save response:', response.data);

      Toast.show({
        type: 'success',
        text1: 'Saved',
        text2: 'Tracking stages updated successfully',
        position: 'top',
        topOffset: 60,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error saving stages:', error);
      console.error('Error response:', error.response?.data);
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: error.response?.data?.message || 'Please try again',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setSaving(false);
    }
  };

  const StageCard = ({ 
    icon, 
    title, 
    stageName, 
    hasDetails = false, 
    detailCount = 0,
    details = [],
    newDetail = '',
    setNewDetail = null,
    detailType = null,
    helpText = ''
  }) => {
    const isExpanded = expandedSections[stageName];
    const isCompleted = stages[stageName] === 'completed';
    const canExpand = hasDetails;

    return (
      <View style={styles.stageCard}>
        {/* Stage Header */}
        <TouchableOpacity
          style={styles.stageHeader}
          onPress={() => canExpand && toggleSection(stageName)}
          activeOpacity={canExpand ? 0.7 : 1}
        >
          <View style={styles.stageHeaderLeft}>
            <View style={[
              styles.stageIconContainer,
              isCompleted && styles.stageIconContainerCompleted
            ]}>
              <Ionicons 
                name={icon} 
                size={20} 
                color={isCompleted ? '#4CAF50' : COLORS.mediumGray} 
              />
            </View>
            <View style={styles.stageHeaderText}>
              <Text style={styles.stageTitle}>{title}</Text>
              {hasDetails && detailCount > 0 && (
                <Text style={styles.stageSubtitle}>
                  {detailCount} detail{detailCount !== 1 ? 's' : ''} added
                </Text>
              )}
              {hasDetails && detailCount === 0 && (
                <Text style={[styles.stageSubtitle, { color: COLORS.mediumGray }]}>
                  No details yet
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.stageHeaderRight}>
            <Switch
              value={isCompleted}
              onValueChange={() => toggleStage(stageName)}
              trackColor={{ false: '#D1D5DB', true: '#4CAF50' }}
              thumbColor={COLORS.white}
            />
            {canExpand && (
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color={COLORS.mediumGray}
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Expanded Details Section */}
        {canExpand && isExpanded && (
          <View style={styles.stageDetails}>
            {helpText !== '' && (
              <View style={styles.helpBox}>
                <Ionicons name="information-circle" size={16} color={COLORS.primary} />
                <Text style={styles.helpText}>{helpText}</Text>
              </View>
            )}

            {details.length > 0 && (
              <View style={styles.detailsList}>
                {details.map((detail, index) => (
                  <View key={index} style={styles.detailItemCompact}>
                    <View style={styles.detailBullet} />
                    <Text style={styles.detailItemTextCompact}>{detail}</Text>
                    <TouchableOpacity
                      onPress={() => removeDetail(detailType, index)}
                      style={styles.removeButtonCompact}
                    >
                      <Ionicons name="close-circle" size={18} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.addDetailRowCompact}>
              <TextInput
                style={styles.detailInputCompact}
                placeholder={`Add information...`}
                placeholderTextColor={COLORS.mediumGray}
                value={newDetail}
                onChangeText={setNewDetail}
                multiline
              />
              <TouchableOpacity
                style={styles.addButtonCompact}
                onPress={() => addDetail(detailType)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const StageToggle = ({ title, stageName }) => (
    <View style={styles.stageToggle}>
      <Text style={styles.stageToggleLabel}>{title}</Text>
      <Switch
        value={stages[stageName] === 'completed'}
        onValueChange={() => toggleStage(stageName)}
        trackColor={{ false: '#D1D5DB', true: '#4CAF50' }}
        thumbColor={COLORS.white}
      />
    </View>
  );

  const DetailSection = ({ title, details, newDetail, setNewDetail, type }) => (
    <View style={styles.detailSection}>
      <Text style={styles.detailSectionTitle}>{title}</Text>
      
      {details.map((detail, index) => (
        <View key={index} style={styles.detailItem}>
          <Text style={styles.detailItemText}>{detail}</Text>
          <TouchableOpacity
            onPress={() => removeDetail(type, index)}
            style={styles.removeButton}
          >
            <Ionicons name="close-circle" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.addDetailRow}>
        <TextInput
          style={styles.detailInput}
          placeholder={`Add ${title.toLowerCase()}...`}
          placeholderTextColor={COLORS.mediumGray}
          value={newDetail}
          onChangeText={setNewDetail}
          multiline
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addDetail(type)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Manage Tracking</Text>
          <Text style={styles.headerSubtitle}>
            {application?.trackingCode}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoBannerText}>
            Toggle stages on/off and tap to add details for each stage
          </Text>
        </View>

        {/* Application Stage (Always Completed) */}
        <View style={styles.stageCard}>
          <View style={styles.stageHeader}>
            <View style={styles.stageHeaderLeft}>
              <View style={[styles.stageIconContainer, styles.stageIconContainerCompleted]}>
                <Ionicons name="document-text" size={20} color="#4CAF50" />
              </View>
              <View style={styles.stageHeaderText}>
                <Text style={styles.stageTitle}>Application Submitted</Text>
                <Text style={styles.stageSubtitle}>Automatically completed</Text>
              </View>
            </View>
            <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
          </View>
        </View>

        {/* Screening Stage */}
        <StageCard
          icon="search"
          title="Screening"
          stageName="screening"
          hasDetails={false}
        />

        {/* Exam Stage */}
        <StageCard
          icon="school"
          title="Entrance Exam"
          stageName="exam"
          hasDetails={true}
          detailCount={examDetails.length}
          details={examDetails}
          newDetail={newExamDetail}
          setNewDetail={setNewExamDetail}
          detailType="exam"
          helpText="Add exam schedule, venue, instructions, or results"
        />

        {/* Interview Stage */}
        <StageCard
          icon="people"
          title="Interview"
          stageName="interview"
          hasDetails={true}
          detailCount={interviewDetails.length}
          details={interviewDetails}
          newDetail={newInterviewDetail}
          setNewDetail={setNewInterviewDetail}
          detailType="interview"
          helpText="Add interview date, time, location, or panel details"
        />

        {/* Enrollment Stage */}
        <StageCard
          icon="clipboard"
          title="Enrollment Selection"
          stageName="enrollment"
          hasDetails={true}
          detailCount={enrollmentDetails.length}
          details={enrollmentDetails}
          newDetail={newEnrollmentDetail}
          setNewDetail={setNewEnrollmentDetail}
          detailType="enrollment"
          helpText="Add enrollment instructions, deadlines, or requirements"
        />

        {/* ID Issuance Stage */}
        <StageCard
          icon="card"
          title="ID & Email Issuance"
          stageName="idIssuance"
          hasDetails={true}
          detailCount={idDetails.length}
          details={idDetails}
          newDetail={newIdDetail}
          setNewDetail={setNewIdDetail}
          detailType="id"
          helpText="Add ID pickup details or email credentials information"
        />

        {/* Disqualification Section */}
        <View style={styles.disqualificationCard}>
          <TouchableOpacity
            style={styles.disqualificationHeader}
            onPress={() => toggleSection('disqualification')}
            activeOpacity={0.7}
          >
            <View style={styles.stageHeaderLeft}>
              <View style={styles.disqualificationIconContainer}>
                <Ionicons name="alert-circle" size={20} color="#F44336" />
              </View>
              <View style={styles.stageHeaderText}>
                <Text style={styles.disqualificationTitle}>Disqualification</Text>
                <Text style={styles.stageSubtitle}>
                  {disqualificationReasons.length > 0 
                    ? `${disqualificationReasons.length} reason${disqualificationReasons.length !== 1 ? 's' : ''} added`
                    : 'No reasons added'}
                </Text>
              </View>
            </View>
            <Ionicons 
              name={expandedSections.disqualification ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={COLORS.mediumGray}
            />
          </TouchableOpacity>

          {expandedSections.disqualification && (
            <View style={styles.stageDetails}>
              <View style={styles.helpBox}>
                <Ionicons name="information-circle" size={16} color="#F44336" />
                <Text style={styles.helpText}>
                  Add reasons if the applicant is disqualified
                </Text>
              </View>

              {disqualificationReasons.length > 0 && (
                <View style={styles.detailsList}>
                  {disqualificationReasons.map((reason, index) => (
                    <View key={index} style={styles.detailItemCompact}>
                      <View style={[styles.detailBullet, { backgroundColor: '#F44336' }]} />
                      <Text style={styles.detailItemTextCompact}>{reason}</Text>
                      <TouchableOpacity
                        onPress={() => removeDetail('disqualification', index)}
                        style={styles.removeButtonCompact}
                      >
                        <Ionicons name="close-circle" size={18} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.addDetailRowCompact}>
                <TextInput
                  style={styles.detailInputCompact}
                  placeholder="Add disqualification reason..."
                  placeholderTextColor={COLORS.mediumGray}
                  value={newDisqualification}
                  onChangeText={setNewDisqualification}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.addButtonCompact, { backgroundColor: '#F44336' }]}
                  onPress={() => addDetail('disqualification')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={18} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <>
              <Ionicons name="save" size={20} color={COLORS.white} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.md,
    paddingBottom: 30,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 18,
  },
  stageCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  stageHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  stageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.ultraLightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageIconContainerCompleted: {
    backgroundColor: '#4CAF50' + '15',
  },
  stageHeaderText: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  stageSubtitle: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.regular,
    marginTop: 2,
  },
  stageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageDetails: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    gap: 8,
  },
  helpText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    lineHeight: 16,
  },
  detailsList: {
    marginBottom: 12,
    gap: 8,
  },
  detailItemCompact: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 6,
    padding: 10,
    gap: 8,
  },
  detailBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  detailItemTextCompact: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 18,
  },
  removeButtonCompact: {
    padding: 2,
  },
  addDetailRowCompact: {
    flexDirection: 'row',
    gap: 8,
  },
  detailInputCompact: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.regular,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  addButtonCompact: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disqualificationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F44336' + '30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  disqualificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  disqualificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F44336' + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disqualificationTitle: {
    fontSize: 15,
    color: '#F44336',
    ...FONTS.semiBold,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
  },
  // Old styles kept for compatibility
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 16,
  },
  stageToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  stageToggleLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.medium,
  },
  detailSection: {
    gap: 12,
  },
  detailSectionTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  detailItemText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  removeButton: {
    padding: 4,
  },
  addDetailRow: {
    flexDirection: 'row',
    gap: 10,
  },
  detailInput: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.regular,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminTrackingManagementScreen;
