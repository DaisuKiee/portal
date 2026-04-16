import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { applicationAPI } from '../services/api';

const ApplicationDetailsScreen = ({ navigation, route }) => {
  const { trackingCode } = route.params;
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const [editedData, setEditedData] = useState({});

  useEffect(() => {
    loadApplication();
  }, []);

  const loadApplication = async () => {
    try {
      const response = await applicationAPI.getByTrackingCode(trackingCode);
      console.log('📋 Application Data:', JSON.stringify(response.data, null, 2));
      setApplication(response.data);
      setEditedData(response.data);
    } catch (error) {
      console.error('Error loading application:', error);
      Alert.alert('Error', 'Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await applicationAPI.update(application._id, editedData);
      setApplication(editedData);
      setEditing(false);
      Alert.alert('Success', 'Application updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update application');
    }
  };

  const handleFileUpload = async () => {
    Alert.alert(
      'Upload File',
      'Choose upload method',
      [
        {
          text: 'Take Photo',
          onPress: () => takePhoto(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage(),
        },
        {
          text: 'Browse Files',
          onPress: () => pickFile(),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      // Handle file upload
      Alert.alert('Success', 'Photo captured successfully');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      // Handle file upload
      Alert.alert('Success', 'Image selected successfully');
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      // Handle file upload
      Alert.alert('Success', 'File selected successfully');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!application) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Application not found</Text>
      </View>
    );
  }

  const stages = [
    { key: 'application', name: 'Application', icon: 'document-text' },
    { key: 'screening', name: 'Screening', icon: 'search' },
    { key: 'exam', name: 'Exam', icon: 'school' },
    { key: 'interview', name: 'Interview', icon: 'chatbubbles' },
    { key: 'enrollment', name: 'Enrollment Selection', icon: 'checkmark-circle' },
    { key: 'idIssuance', name: 'Issuance of ID Number and Email', icon: 'card' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admission Portal</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.editButton}>
          <Ionicons name={editing ? "close" : "create-outline"} size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Announcement Banner */}
        <View style={styles.announcementBanner}>
          <View style={styles.announcementHeader}>
            <Text style={styles.announcementTitle}>
              Announcement from {application.programData?.college || 'College'}
            </Text>
            <TouchableOpacity>
              <Ionicons name="close" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <Text style={styles.announcementText}>
            Thank you for applying in the {application.programData?.college || 'College'}. 
            Always track your application in the Admission Portal to keep updated of your admission status. 
            Check always your email for any notifications regarding your application.
          </Text>
        </View>

        {/* Admission Process */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admission Process</Text>
          <View style={styles.stagesContainer}>
            {stages.map((stage, index) => {
              const status = application.stages?.[stage.key] || 'pending';
              const isCompleted = status === 'completed';
              
              return (
                <View key={stage.key} style={styles.stageRow}>
                  <View style={styles.stageLeft}>
                    <View style={[
                      styles.stageIcon,
                      isCompleted && styles.stageIconCompleted
                    ]}>
                      <Ionicons 
                        name={isCompleted ? "checkmark" : stage.icon} 
                        size={20} 
                        color={isCompleted ? COLORS.white : COLORS.mediumGray} 
                      />
                    </View>
                    <Text style={[
                      styles.stageName,
                      isCompleted && styles.stageNameCompleted
                    ]}>
                      {stage.name}
                    </Text>
                  </View>
                  {isCompleted && (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Disqualification Reasons */}
        {application.disqualificationReasons && application.disqualificationReasons.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disqualification Reasons:</Text>
            {application.disqualificationReasons.map((reason, index) => (
              <Text key={index} style={styles.disqualificationText}>
                {index + 1}. {reason}
              </Text>
            ))}
          </View>
        )}

        {/* Applicant Photo and Info */}
        <View style={styles.section}>
          <View style={styles.photoContainer}>
            {application.documents?.idPhoto?.uri || application.documents?.idPhoto?.base64 ? (
              <Image 
                source={{ uri: application.documents.idPhoto.base64 ? `data:image/jpeg;base64,${application.documents.idPhoto.base64}` : application.documents.idPhoto.uri }} 
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="person" size={60} color={COLORS.mediumGray} />
              </View>
            )}
            <Text style={styles.applicantName}>
              {application.personalInfo?.lastName ? application.personalInfo.lastName.toUpperCase() : ''}{application.personalInfo?.lastName && application.personalInfo?.firstName ? ', ' : ''}{application.personalInfo?.firstName ? application.personalInfo.firstName.toUpperCase() : ''}{application.personalInfo?.middleName ? ` ${application.personalInfo.middleName.charAt(0)}.` : ''}
            </Text>
          </View>

          {/* Applicant Details */}
          <View style={styles.detailsContainer}>
            <DetailRow 
              label="APPLICANT ID" 
              value={application.trackingCode} 
              editing={false}
            />
            <DetailRow 
              label="FULL NAME" 
              value={[
                application.personalInfo?.firstName,
                application.personalInfo?.middleName,
                application.personalInfo?.lastName,
                application.personalInfo?.suffix
              ].filter(Boolean).join(' ') || 'N/A'} 
              editing={false}
            />
            <DetailRow 
              label="ADDRESS" 
              value={application.personalInfo?.address ? 
                [
                  application.personalInfo.address.street,
                  application.personalInfo.address.barangay,
                  application.personalInfo.address.municipality,
                  application.personalInfo.address.province
                ].filter(Boolean).join(', ') || 'N/A'
                : 'N/A'
              } 
              editing={false}
            />
            <DetailRow 
              label="CONTACT NUMBER" 
              value={application.personalInfo?.contactNumber || 'N/A'} 
              editing={false}
            />
            <DetailRow 
              label="EMAIL" 
              value={application.personalInfo?.email || 'N/A'} 
              editing={false}
            />
          </View>

          {/* More Details */}
          <View style={styles.detailsContainer}>
            <DetailRow 
              label="COURSE APPLIED" 
              value={application.preferredCourse || application.programData?.courseName || 'N/A'} 
              editing={false} 
            />
            <DetailRow label="PROGRAM/SESSION" value={application.programData?.session || 'N/A'} editing={false} />
            <DetailRow label="GWA" value={application.programData?.gwa || 'N/A'} editing={false} />
            <DetailRow label="CAMPUS" value="Main Campus" editing={false} />
            <DetailRow label="COLLEGE/DEPARTMENT" value={application.programData?.college || 'N/A'} editing={false} />
            <DetailRow label="CATEGORY" value={application.programData?.category || 'N/A'} editing={false} />
            <DetailRow label="GENDER" value={application.personalInfo?.gender || 'N/A'} editing={false} />
            <DetailRow label="AGE" value={calculateAge(application.personalInfo?.birthDate)} editing={false} />
            <DetailRow label="CITIZENSHIP" value={application.personalInfo?.nationality || 'N/A'} editing={false} />
            <DetailRow label="RELIGION" value={application.personalInfo?.religion || 'N/A'} editing={false} />
            <DetailRow label="CIVIL STATUS" value={application.personalInfo?.civilStatus || 'N/A'} editing={false} />
            <DetailRow 
              label="BIRTHDATE" 
              value={application.personalInfo?.birthDate || 'N/A'} 
              editing={false} 
            />
            <DetailRow 
              label="BIRTHPLACE" 
              value={application.personalInfo?.birthPlace || 'N/A'} 
              editing={false} 
            />
            <DetailRow 
              label="COMPLETE ADDRESS" 
              value={application.personalInfo?.address ? 
                [
                  application.personalInfo.address.street,
                  application.personalInfo.address.barangay,
                  application.personalInfo.address.municipality,
                  application.personalInfo.address.province,
                  application.personalInfo.address.zipCode
                ].filter(Boolean).join(', ') || 'N/A'
                : 'N/A'
              } 
              editing={false} 
            />
            <DetailRow label="TRACKING CODE" value={application.trackingCode} editing={false} />
            <DetailRow 
              label="DATE APPLIED" 
              value={application.submittedAt ? 
                new Date(application.submittedAt).toLocaleString() : 
                'N/A'
              } 
              editing={false} 
            />
          </View>

          {/* Add Files Section */}
          <View style={styles.addFilesSection}>
            <Text style={styles.addFilesLabel}>Add files:</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={handleFileUpload}>
              <Ionicons name="add" size={40} color={COLORS.mediumGray} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadFileButton} onPress={handleFileUpload}>
              <Text style={styles.uploadFileButtonText}>Upload File</Text>
            </TouchableOpacity>
          </View>

          {/* Requirements Dropdown */}
          <TouchableOpacity 
            style={styles.requirementsHeader}
            onPress={() => setShowRequirements(!showRequirements)}
          >
            <Text style={styles.requirementsTitle}>Uploaded Requirements</Text>
            <Ionicons 
              name={showRequirements ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={COLORS.secondary} 
            />
          </TouchableOpacity>

          {showRequirements && (
            <View style={styles.requirementsList}>
              {[
                { id: 'idPhoto', title: '2x2 ID Photo', required: true },
                { id: 'birthCertificate', title: 'Birth Certificate (PSA)', required: true },
                { id: 'form137', title: 'Form 137 / Report Card', required: true },
                { id: 'goodMoral', title: 'Certificate of Good Moral', required: true },
                { id: 'transferCredentials', title: 'Transfer Credentials', required: false }
              ].map((req, index) => {
                const uploaded = application.documents?.[req.id];
                return (
                  <View key={index} style={styles.requirementCard}>
                    <View style={styles.requirementHeader}>
                      <View style={styles.requirementIconContainer}>
                        <Ionicons 
                          name={uploaded ? "checkmark-circle" : "document-text-outline"} 
                          size={24} 
                          color={uploaded ? COLORS.success : COLORS.mediumGray} 
                        />
                      </View>
                      <View style={styles.requirementInfo}>
                        <View style={styles.requirementTitleRow}>
                          <Text style={styles.requirementTitle}>{req.title}</Text>
                          {req.required && !uploaded && (
                            <View style={styles.requiredBadge}>
                              <Text style={styles.requiredBadgeText}>Required</Text>
                            </View>
                          )}
                          {uploaded && (
                            <View style={styles.uploadedBadge}>
                              <Text style={styles.uploadedBadgeText}>Uploaded</Text>
                            </View>
                          )}
                        </View>
                        {uploaded && (
                          <Text style={styles.requirementFileName} numberOfLines={1}>
                            {uploaded.name}
                          </Text>
                        )}
                      </View>
                    </View>
                    
                    {uploaded && (uploaded.uri || uploaded.base64) && (
                      <View style={styles.documentPreview}>
                        {uploaded.type?.includes('image') ? (
                          <Image 
                            source={{ uri: uploaded.base64 ? `data:image/jpeg;base64,${uploaded.base64}` : uploaded.uri }} 
                            style={styles.documentImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.documentPdfPreview}>
                            <Ionicons name="document-text" size={40} color={COLORS.primary} />
                            <Text style={styles.pdfText}>PDF Document</Text>
                          </View>
                        )}
                        <View style={styles.documentInfo}>
                          <Text style={styles.documentSize}>
                            {uploaded.size ? `${(uploaded.size / 1024).toFixed(2)} KB` : 'Unknown size'}
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    {!uploaded && (
                      <View style={styles.notUploadedContainer}>
                        <Ionicons name="alert-circle-outline" size={20} color={COLORS.mediumGray} />
                        <Text style={styles.notUploadedText}>Not yet uploaded</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Save Button */}
        {editing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const DetailRow = ({ label, value, editing, onChangeText }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailColon}>:</Text>
    {editing && onChangeText ? (
      <TextInput
        style={styles.detailInput}
        value={value}
        onChangeText={onChangeText}
      />
    ) : (
      <Text style={styles.detailValue}>{value}</Text>
    )}
  </View>
);

const calculateAge = (birthDate) => {
  if (!birthDate) return 'N/A';
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age.toString();
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    ...FONTS.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  announcementBanner: {
    backgroundColor: COLORS.primary,
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementTitle: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.bold,
    marginRight: 8,
  },
  announcementText: {
    fontSize: 13,
    color: COLORS.white,
    ...FONTS.regular,
    lineHeight: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 12,
  },
  stagesContainer: {
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 12,
    padding: 12,
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  stageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageIconCompleted: {
    backgroundColor: COLORS.success,
  },
  stageName: {
    fontSize: 14,
    color: COLORS.darkGray,
    ...FONTS.medium,
    flex: 1,
  },
  stageNameCompleted: {
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  completedBadge: {
    marginLeft: 8,
  },
  disqualificationText: {
    fontSize: 13,
    color: COLORS.error,
    ...FONTS.regular,
    lineHeight: 20,
    marginBottom: 8,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  applicantName: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
    textAlign: 'center',
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    width: 140,
    fontSize: 12,
    color: COLORS.darkGray,
    ...FONTS.medium,
  },
  detailColon: {
    fontSize: 12,
    color: COLORS.darkGray,
    marginHorizontal: 8,
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  detailInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.secondary,
    ...FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewButton: {
    backgroundColor: COLORS.success,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  },
  viewButtonText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  addFilesSection: {
    marginVertical: 16,
    alignItems: 'center',
  },
  addFilesLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.medium,
    marginBottom: 12,
  },
  uploadBox: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadFileButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  uploadFileButtonText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  requirementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    marginTop: 16,
  },
  requirementsTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  requirementsList: {
    paddingTop: 12,
    gap: 12,
  },
  requirementCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    ...SHADOWS.small,
  },
  requirementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementIconContainer: {
    marginRight: 12,
  },
  requirementInfo: {
    flex: 1,
  },
  requirementTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  requirementTitle: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  requiredBadgeText: {
    fontSize: 10,
    color: COLORS.error,
    ...FONTS.bold,
  },
  uploadedBadge: {
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  uploadedBadgeText: {
    fontSize: 10,
    color: COLORS.success,
    ...FONTS.bold,
  },
  requirementFileName: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  documentPreview: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.ultraLightGray,
  },
  documentImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.lightGray,
  },
  documentPdfPreview: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
  pdfText: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.medium,
    marginTop: 8,
  },
  documentInfo: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  documentSize: {
    fontSize: 11,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  notUploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  notUploadedText: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
  },
});

export default ApplicationDetailsScreen;
