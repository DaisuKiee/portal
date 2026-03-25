import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  ActivityIndicator,
  ImageBackground,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { pretestAPI } from '../services/api';

const guidelines = [
  'Only graduates of Senior High School or its equivalent are eligible to apply for admission to Cebu Technological University - Daanbantayan Campus for the 1st Semester, AY 2026-2027.',
  'Applicants must carefully read and follow the steps in this online application portal.',
  'All information provided must be accurate and truthful. Any falsification of documents or information shall be grounds for disqualification.',
  'A documentary requirement checklist will be presented during the application. Please ensure you have all necessary documents ready for submission.',
  'The student is required to keep their tracking code safe as it will be used to monitor the status of their application.',
  'For transferees or second-degree applicants, additional requirements may apply. Please contact the registrar\'s office for more information.',
  'CTU Daanbantayan Campus reserves the right to verify all submitted documents and information.',
  'Admission is not guaranteed until all requirements are submitted and evaluated by the admissions committee.',
];

const GuidelinesScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkPretestStatus();
    
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

  const checkPretestStatus = async () => {
    try {
      const response = await pretestAPI.checkStatus();
      if (response.data.completed) {
        // User already completed pretest, skip to application form
        console.log('Pretest already completed, skipping to application form');
        navigation.replace('AdmissionForm', {
          selectedCourse: response.data.result.recommendedCourse,
          courseName: response.data.result.courseName,
          aiAnalysis: response.data.result.analysis,
          pretestAnswers: [],
        });
      }
    } catch (error) {
      console.error('Error checking pretest status:', error);
      // Continue to guidelines if check fails
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground 
        source={require('../../assets/ctubg.jpg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} pointerEvents="none" />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/ctu.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.headerTitle}>Admission Portal</Text>
          <Text style={styles.headerSubtitle}>CTU Daanbantayan Campus</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <Animated.View 
            style={[
              styles.titleSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="document-text" size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Admission Guidelines</Text>
            <Text style={styles.subtitle}>
              GENERAL GUIDELINES FOR NEW STUDENT APPLICATION
            </Text>
            <Text style={styles.academicYear}>Academic Year 2026-2027</Text>
          </Animated.View>

          <Animated.View 
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.cardGlass} pointerEvents="none" />
            
            <View style={styles.cardContent}>
              <View style={styles.importantBanner}>
                <View style={styles.importantIconContainer}>
                  <Ionicons name="alert-circle" size={24} color={COLORS.warning} />
                </View>
                <Text style={styles.importantText}>
                  Please read the following guidelines carefully before proceeding with your application.
                </Text>
              </View>

              {guidelines.map((item, index) => (
                <View key={index} style={styles.guidelineItem}>
                  <View style={styles.numberCircle}>
                    <Text style={styles.numberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.guidelineText}>{item}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View 
            style={[
              styles.checkboxSection,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.checkboxCard}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              <Text style={styles.checkboxText}>
                By proceeding, you acknowledge that you have read and understood the above guidelines.
              </Text>
            </View>
          </Animated.View>

          <Animated.View 
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => navigation.navigate('Pretest')}
              activeOpacity={0.8}
            >
              <View style={styles.buttonGradient} />
              <Text style={styles.continueButtonText}>I Understand, Continue</Text>
              <Ionicons name="arrow-forward-circle" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.92)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.medium,
    marginTop: 12,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: SIZES.lg,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  headerTitle: {
    fontSize: 24,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
  },
  title: {
    fontSize: 26,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.white + 'CC',
    ...FONTS.semiBold,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 6,
  },
  academicYear: {
    fontSize: 14,
    color: COLORS.primaryLight,
    ...FONTS.bold,
    letterSpacing: 0.5,
  },
  card: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  cardContent: {
    padding: 20,
  },
  importantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  importantIconContainer: {
    marginRight: 12,
  },
  importantText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.white,
    ...FONTS.medium,
    lineHeight: 19,
  },
  guidelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 2,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  numberText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.bold,
  },
  guidelineText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.white + 'EE',
    ...FONTS.regular,
    lineHeight: 21,
  },
  checkboxSection: {
    marginBottom: 20,
  },
  checkboxCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.white + 'DD',
    ...FONTS.medium,
    lineHeight: 19,
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: 0.5,
  },
});

export default GuidelinesScreen;
