import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

const FormStep3 = ({ data, onUpdate }) => {
  const [uploadingDoc, setUploadingDoc] = useState(null);

  const requiredDocuments = [
    {
      id: 'birthCertificate',
      title: 'Birth Certificate',
      description: 'PSA-issued birth certificate (original or certified true copy)',
      icon: 'document-text',
      required: true,
    },
    {
      id: 'form137',
      title: 'Form 137 / Report Card',
      description: 'Official transcript of records or report card',
      icon: 'school',
      required: true,
    },
    {
      id: 'goodMoral',
      title: 'Certificate of Good Moral',
      description: 'From previous school attended',
      icon: 'ribbon',
      required: true,
    },
    {
      id: 'idPhoto',
      title: '2x2 ID Photo',
      description: 'Recent photo with white background',
      icon: 'camera',
      required: true,
    },
    {
      id: 'transferCredentials',
      title: 'Transfer Credentials',
      description: 'For transferees only (Honorable Dismissal, TOR)',
      icon: 'swap-horizontal',
      required: false,
    },
  ];

  const pickDocument = async (docId) => {
    try {
      setUploadingDoc(docId);
      
      Alert.alert(
        'Select Upload Method',
        'Choose how you want to upload this document',
        [
          {
            text: 'Take Photo',
            onPress: () => takePhoto(docId),
          },
          {
            text: 'Choose from Gallery',
            onPress: () => pickImage(docId),
          },
          {
            text: 'Browse Files',
            onPress: () => pickFile(docId),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setUploadingDoc(null),
          },
        ]
      );
    } catch (error) {
      console.error('Error picking document:', error);
      setUploadingDoc(null);
    }
  };

  const takePhoto = async (docId) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        setUploadingDoc(null);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        updateDocument(docId, {
          uri: result.assets[0].uri,
          name: `${docId}_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: result.assets[0].fileSize,
        });
      }
      setUploadingDoc(null);
    } catch (error) {
      console.error('Error taking photo:', error);
      setUploadingDoc(null);
    }
  };

  const pickImage = async (docId) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to select photos');
        setUploadingDoc(null);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        updateDocument(docId, {
          uri: result.assets[0].uri,
          name: `${docId}_${Date.now()}.jpg`,
          type: 'image/jpeg',
          size: result.assets[0].fileSize,
        });
      }
      setUploadingDoc(null);
    } catch (error) {
      console.error('Error picking image:', error);
      setUploadingDoc(null);
    }
  };

  const pickFile = async (docId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        updateDocument(docId, {
          uri: result.uri,
          name: result.name,
          type: result.mimeType,
          size: result.size,
        });
      }
      setUploadingDoc(null);
    } catch (error) {
      console.error('Error picking file:', error);
      setUploadingDoc(null);
    }
  };

  const updateDocument = (docId, fileData) => {
    onUpdate({
      ...data,
      documents: {
        ...(data.documents || {}),
        [docId]: fileData,
      },
    });
  };

  const removeDocument = (docId) => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newDocuments = { ...(data.documents || {}) };
            delete newDocuments[docId];
            onUpdate({ ...data, documents: newDocuments });
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const renderDocumentCard = (doc) => {
    const uploaded = data.documents?.[doc.id];
    const isUploading = uploadingDoc === doc.id;

    return (
      <View key={doc.id} style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <View style={styles.documentIconContainer}>
            <Ionicons 
              name={uploaded ? 'checkmark-circle' : doc.icon} 
              size={24} 
              color={uploaded ? COLORS.success : COLORS.primary} 
            />
          </View>
          <View style={styles.documentInfo}>
            <View style={styles.documentTitleRow}>
              <Text style={styles.documentTitle}>{doc.title}</Text>
              {doc.required && (
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredBadgeText}>Required</Text>
                </View>
              )}
            </View>
            <Text style={styles.documentDescription}>{doc.description}</Text>
          </View>
        </View>

        {uploaded ? (
          <View style={styles.uploadedContainer}>
            <View style={styles.uploadedInfo}>
              <Ionicons name="document-attach" size={20} color={COLORS.success} />
              <View style={styles.uploadedDetails}>
                <Text style={styles.uploadedFileName} numberOfLines={1}>
                  {uploaded.name}
                </Text>
                <Text style={styles.uploadedFileSize}>
                  {formatFileSize(uploaded.size)}
                </Text>
              </View>
            </View>
            <View style={styles.uploadedActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => pickDocument(doc.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => removeDocument(doc.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={() => !isUploading && pickDocument(doc.id)}
            activeOpacity={0.7}
            disabled={isUploading}
          >
            <Ionicons 
              name={isUploading ? 'hourglass' : 'cloud-upload-outline'} 
              size={20} 
              color={COLORS.white} 
            />
            <Text style={styles.uploadButtonText}>
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const uploadedCount = Object.keys(data.documents || {}).length;
  const requiredCount = requiredDocuments.filter(doc => doc.required).length;
  const uploadedRequired = requiredDocuments.filter(
    doc => doc.required && data.documents?.[doc.id]
  ).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="document-text" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.sectionTitle}>Uploading of Requirements</Text>
          <Text style={styles.sectionDesc}>
            Upload clear photos or scanned copies of your documents
          </Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Upload Progress</Text>
          <Text style={styles.progressCount}>
            {uploadedRequired}/{requiredCount} Required
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${(uploadedRequired / requiredCount) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {uploadedCount} of {requiredDocuments.length} documents uploaded
        </Text>
      </View>

      <View style={styles.documentsContainer}>
        {requiredDocuments.map(renderDocumentCard)}
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          Accepted formats: JPG, PNG, PDF • Maximum file size: 5MB per document
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  headerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 2,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    ...SHADOWS.medium,
    marginBottom: SIZES.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  progressCount: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  documentsContainer: {
    gap: 12,
  },
  documentCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    ...SHADOWS.medium,
    marginBottom: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  documentTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  requiredBadge: {
    backgroundColor: COLORS.error + '15',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  requiredBadgeText: {
    fontSize: 10,
    color: COLORS.error,
    ...FONTS.bold,
    textTransform: 'uppercase',
  },
  documentDescription: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    lineHeight: 18,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    paddingVertical: 12,
    gap: 8,
    ...SHADOWS.small,
  },
  uploadButtonDisabled: {
    backgroundColor: COLORS.mediumGray,
  },
  uploadButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.success + '08',
    borderRadius: SIZES.borderRadiusSm,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  uploadedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  uploadedDetails: {
    flex: 1,
  },
  uploadedFileName: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 2,
  },
  uploadedFileSize: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  uploadedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    borderRadius: SIZES.borderRadiusSm,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
    gap: 10,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.darkGray,
    ...FONTS.regular,
  },
});

export default FormStep3;
