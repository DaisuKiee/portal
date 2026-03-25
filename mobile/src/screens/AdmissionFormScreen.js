import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { applicationAPI, courseAPI } from '../services/api';
import StepIndicator from '../components/StepIndicator';
import FormStep0 from '../components/FormStep0';
import FormStep1 from '../components/FormStep1';
import FormStep3 from '../components/FormStep3';

const FORM_STORAGE_KEY = '@admission_form_draft';

const AdmissionFormScreen = ({ navigation, route }) => {
  const { selectedCourse, courseName, aiAnalysis, pretestAnswers } = route.params || {};
  
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [courses, setCourses] = useState([]);
  const [trackingCode, setTrackingCode] = useState('');
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const [isSaving, setIsSaving] = useState(false);

  const [programData, setProgramData] = useState({
    category: '',
    college: '',
    session: '',
    gwa: '',
    course: selectedCourse || '',
    courseName: courseName || '',
  });

  const [personalInfo, setPersonalInfo] = useState({
    firstName: '', middleName: '', lastName: '', suffix: '',
    birthDate: '', birthPlace: '', gender: '', civilStatus: '',
    contactNumber: '', email: '', nationality: 'Filipino', religion: '',
    address: { street: '', barangay: '', municipality: '', province: '', zipCode: '' },
  });

  const [documentsData, setDocumentsData] = useState({
    checkedDocs: {}, documentsAcknowledged: false,
  });

  useEffect(() => {
    loadCourses();
    loadSavedFormData();
    animateIn();
  }, []);

  useEffect(() => {
    animateIn();
  }, [currentStep]);

  // Auto-save form data whenever it changes
  useEffect(() => {
    saveFormData();
  }, [programData, personalInfo, documentsData]);

  const loadSavedFormData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Only load saved data if there's no pretest data
        if (!selectedCourse) {
          if (parsed.programData) setProgramData(parsed.programData);
        } else {
          // If there's pretest data, merge it with saved data
          if (parsed.programData) {
            setProgramData({
              ...parsed.programData,
              course: selectedCourse,
              courseName: courseName,
            });
          }
        }
        
        if (parsed.personalInfo) setPersonalInfo(parsed.personalInfo);
        if (parsed.documentsData) setDocumentsData(parsed.documentsData);
        if (parsed.currentStep && !selectedCourse) setCurrentStep(parsed.currentStep);
        
        Toast.show({
          type: 'info',
          text1: 'Draft Restored',
          text2: 'Your previous form data has been restored.',
          position: 'top',
          topOffset: 60,
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('Error loading saved form data:', error);
    }
  };

  const saveFormData = async () => {
    try {
      setIsSaving(true);
      const dataToSave = {
        programData,
        personalInfo,
        documentsData,
        currentStep,
        savedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
      
      // Show saving indicator briefly
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Error saving form data:', error);
      setIsSaving(false);
    }
  };

  const clearSavedFormData = async () => {
    try {
      await AsyncStorage.removeItem(FORM_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing saved form data:', error);
    }
  };

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = (callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!programData.category || !programData.college || !programData.session || !programData.course) {
          Toast.show({
            type: 'warning',
            text1: 'Required Fields',
            text2: 'Please fill in all program application fields.',
            position: 'top',
            topOffset: 60,
          });
          return false;
        }
        if (!programData.gwa || programData.gwa.trim() === '') {
          Toast.show({
            type: 'warning',
            text1: 'GWA Required',
            text2: 'Please enter your General Weighted Average (GWA).',
            position: 'top',
            topOffset: 60,
          });
          return false;
        }
        // Validate GWA is a number between 65 and 100
        const gwaValue = parseFloat(programData.gwa);
        if (isNaN(gwaValue) || gwaValue < 65 || gwaValue > 100) {
          Toast.show({
            type: 'warning',
            text1: 'Invalid GWA',
            text2: 'Please enter a valid GWA between 65 and 100.',
            position: 'top',
            topOffset: 60,
          });
          return false;
        }
        return true;
      case 2:
        if (!personalInfo.firstName || !personalInfo.lastName) {
          Toast.show({
            type: 'warning',
            text1: 'Required Fields',
            text2: 'Please fill in at least your first and last name.',
            position: 'top',
            topOffset: 60,
          });
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    
    setIsTransitioning(true);
    
    // Add a small delay for loading animation
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (currentStep === 3) {
      // Submit application after step 3
      await handleSubmit();
    } else if (currentStep < 4) {
      animateOut(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      });
    } else {
      setIsTransitioning(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      animateOut(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await applicationAPI.submit({
        personalInfo,
        programData,
        preferredCourse: programData.course,
        aiRecommendedCourse: selectedCourse || '',
        aiAnalysis: aiAnalysis || '',
        pretestAnswers: pretestAnswers || [],
        documentsAcknowledged: documentsData.documentsAcknowledged,
      });

      setTrackingCode(response.data.trackingCode);
      
      // Clear saved form data after successful submission
      await clearSavedFormData();
      
      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Application Submitted!',
        text2: 'Redirecting to Community Feed...',
        position: 'top',
        topOffset: 60,
        visibilityTime: 2000,
      });
      
      // Automatically navigate to Feed after 2 seconds
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Feed', params: { trackingCode: response.data.trackingCode } }],
        });
      }, 2000);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit application. Please try again.';
      if (error.response?.data?.trackingCode) {
        setTrackingCode(error.response.data.trackingCode);
        await clearSavedFormData();
        
        Toast.show({
          type: 'success',
          text1: 'Application Submitted!',
          text2: 'Redirecting to Community Feed...',
          position: 'top',
          topOffset: 60,
          visibilityTime: 2000,
        });
        
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Feed', params: { trackingCode: error.response.data.trackingCode } }],
          });
        }, 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Submission Failed',
          text2: message,
          position: 'top',
          topOffset: 60,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FormStep0 
          data={programData} 
          onUpdate={setProgramData} 
          courses={courses}
          selectedCourse={selectedCourse}
          courseName={courseName}
        />;
      case 2:
        return <FormStep1 data={personalInfo} onUpdate={setPersonalInfo} />;
      case 3:
        return <FormStep3 data={documentsData} onUpdate={setDocumentsData} />;
      case 4:
        return (
          <View style={styles.trackingContainer}>
            <View style={styles.successIcon}>
              <Text style={styles.successEmoji}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Application Submitted!</Text>
            <Text style={styles.successDesc}>
              Your application has been successfully submitted. Please save your tracking code.
            </Text>
            <View style={styles.trackingCodeBox}>
              <Text style={styles.trackingLabel}>Your Tracking Code</Text>
              <Text style={styles.trackingCodeText}>{trackingCode}</Text>
              <Text style={styles.trackingHint}>Save this code to track your application</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Tracking', { trackingCode })}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={20} color={COLORS.primary} />
                <Text style={styles.secondaryButtonText}>Track Application</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.reset({
                  index: 0,
                  routes: [{ name: 'Feed' }],
                })}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubbles" size={20} color={COLORS.white} />
                <Text style={styles.primaryButtonText}>Community Feed</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Admission Portal</Text>
            <Text style={styles.headerSubtitle}>Application Form</Text>
          </View>
          {isSaving && (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color={COLORS.white} />
              <Text style={styles.savingText}>Saving...</Text>
            </View>
          )}
        </View>
      </View>

      <StepIndicator 
        currentStep={currentStep} 
        totalSteps={4}
        labels={['Program Application', 'Personal Information', 'Uploading of Requirements', 'Tracking Code Issuance']}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.formContainer}
      >
        <Animated.View 
          style={[
            styles.formContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {renderStep()}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Bottom Navigation */}
      {currentStep < 4 && (
        <View style={styles.bottomNav}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              activeOpacity={0.8}
              disabled={isTransitioning || submitting}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              currentStep === 1 && styles.nextButtonFull,
              (submitting || isTransitioning) && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={submitting || isTransitioning}
            activeOpacity={0.8}
          >
            {submitting || isTransitioning ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.loadingText}>
                  {submitting ? 'Submitting...' : 'Loading...'}
                </Text>
              </View>
            ) : (
              <Text style={styles.nextButtonText}>
                {currentStep === 3 ? 'Submit Application' : 'Next →'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
    paddingBottom: 12,
    paddingHorizontal: SIZES.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.white,
    ...FONTS.bold,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.primaryLight,
    ...FONTS.regular,
    marginTop: 2,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary + '40',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  savingText: {
    fontSize: 11,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  trackingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  successEmoji: {
    fontSize: 48,
    color: COLORS.success,
  },
  successTitle: {
    fontSize: 24,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    textAlign: 'center',
    marginBottom: SIZES.xl,
    lineHeight: 20,
  },
  trackingCodeBox: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.lg,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    marginBottom: SIZES.xl,
    alignItems: 'center',
    width: '100%',
  },
  trackingLabel: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.semiBold,
    marginBottom: SIZES.sm,
  },
  trackingCodeText: {
    fontSize: 28,
    color: COLORS.primary,
    ...FONTS.bold,
    letterSpacing: 2,
  },
  trackingHint: {
    fontSize: 12,
    color: COLORS.primary + 'CC',
    ...FONTS.regular,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    paddingVertical: 14,
    gap: 8,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.bold,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    paddingVertical: 14,
    paddingHorizontal: 32,
    ...SHADOWS.medium,
  },
  doneButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    flex: 1,
    padding: SIZES.md,
  },
  bottomNav: {
    flexDirection: 'row',
    padding: SIZES.md,
    paddingBottom: Platform.OS === 'ios' ? 30 : SIZES.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    ...SHADOWS.small,
    gap: 10,
  },
  backButton: {
    flex: 1,
    height: SIZES.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  backButtonText: {
    fontSize: 15,
    color: COLORS.mediumGray,
    ...FONTS.semiBold,
  },
  nextButton: {
    flex: 2,
    height: SIZES.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.borderRadiusSm,
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.bold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
});

export default AdmissionFormScreen;
