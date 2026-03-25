import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

const CourseResultScreen = ({ navigation, route }) => {
  const { result, pretestAnswers } = route.params || {};
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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

  const handleAccept = () => {
    navigation.navigate('AdmissionForm', {
      selectedCourse: result?.recommendedCourse || '',
      courseName: result?.courseName || '',
      aiAnalysis: result?.analysis || '',
      pretestAnswers: pretestAnswers || [],
    });
  };

  const handleChooseDifferent = () => {
    navigation.navigate('AdmissionForm', {
      selectedCourse: null,
      courseName: null,
      aiAnalysis: result?.analysis || '',
      pretestAnswers: pretestAnswers || [],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admission Portal</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Banner */}
        <Animated.View 
          style={[
            styles.successBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Ionicons name="school" size={56} color={COLORS.primary} style={{ marginBottom: 12 }} />
          <Text style={styles.successTitle}>Course Recommendation</Text>
          <Text style={styles.successSubtitle}>
            Based on your answers, our team has found the best course for you!
          </Text>
        </Animated.View>

        {/* Recommended Course Card */}
        <Animated.View 
          style={[
            styles.courseCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: fadeAnim }],
            },
          ]}
        >
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>RECOMMENDED</Text>
          </View>
          <Text style={styles.courseCode}>{result?.recommendedCourse || 'N/A'}</Text>
          <Text style={styles.courseName}>{result?.courseName || 'N/A'}</Text>

          {result?.matchPercentage && (
            <View style={styles.matchContainer}>
              <View style={styles.matchBar}>
                <View
                  style={[
                    styles.matchFill,
                    { width: `${result.matchPercentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.matchText}>{result.matchPercentage}% Match</Text>
            </View>
          )}
        </Animated.View>

        {/* Analysis Card */}
        {result?.analysis && (
          <Animated.View 
            style={[
              styles.analysisCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.analysisTitleRow}>
              <Ionicons name="bulb" size={24} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.analysisTitle}>Our Recommendation</Text>
            </View>
            <Text style={styles.analysisText}>{result.analysis}</Text>
          </Animated.View>
        )}

        {/* Career Prospects */}
        {result?.careerProspects?.length > 0 && (
          <Animated.View 
            style={[
              styles.careerCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="briefcase" size={22} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.careerTitle}>Career Prospects</Text>
            </View>
            <View style={styles.careerList}>
              {result.careerProspects.map((career, index) => (
                <View key={index} style={styles.careerItem}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.careerText}>{career}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Alternative Course */}
        {result?.alternativeCourse && (
          <Animated.View 
            style={[
              styles.alternativeCard,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="bookmark" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.alternativeTitle}>Alternative Option</Text>
            </View>
            <Text style={styles.alternativeCode}>
              {result.alternativeCourse} - {result.alternativeCourseName}
            </Text>
            {result.alternativeReason && (
              <Text style={styles.alternativeReason}>{result.alternativeReason}</Text>
            )}
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View 
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAccept}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptButtonText}>
            Accept & Continue with {result?.recommendedCourse || 'Course'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.differentButton}
          onPress={handleChooseDifferent}
          activeOpacity={0.8}
        >
          <Text style={styles.differentButtonText}>Choose a Different Course</Text>
        </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 16,
    paddingHorizontal: SIZES.lg,
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.white,
    ...FONTS.bold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.md,
    paddingBottom: SIZES.xxl,
  },
  successBanner: {
    alignItems: 'center',
    paddingVertical: SIZES.lg,
  },
  successTitle: {
    fontSize: 22,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  courseCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.lg,
    ...SHADOWS.medium,
    marginBottom: SIZES.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    alignItems: 'center',
  },
  courseBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  courseBadgeText: {
    fontSize: 11,
    color: COLORS.success,
    ...FONTS.bold,
    letterSpacing: 1,
  },
  courseCode: {
    fontSize: 32,
    color: COLORS.primary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.medium,
    textAlign: 'center',
    marginBottom: 12,
  },
  matchContainer: {
    width: '100%',
    marginTop: 8,
  },
  matchBar: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  matchFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  matchText: {
    fontSize: 14,
    color: COLORS.success,
    ...FONTS.bold,
    textAlign: 'center',
  },
  analysisCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    ...SHADOWS.small,
    marginBottom: SIZES.md,
  },
  analysisTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  analysisTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  analysisText: {
    fontSize: 14,
    color: COLORS.darkGray,
    ...FONTS.regular,
    lineHeight: 22,
  },
  careerCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    ...SHADOWS.small,
    marginBottom: SIZES.md,
  },
  careerTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 10,
  },
  careerList: {},
  careerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  careerText: {
    fontSize: 14,
    color: COLORS.darkGray,
    ...FONTS.medium,
  },
  alternativeCard: {
    backgroundColor: COLORS.primary + '08',
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '25',
    marginBottom: SIZES.lg,
  },
  alternativeTitle: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.bold,
    marginBottom: 6,
  },
  alternativeCode: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 4,
  },
  alternativeReason: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    lineHeight: 18,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    height: SIZES.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
    marginBottom: 10,
  },
  acceptButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.bold,
  },
  differentButton: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusSm,
    height: SIZES.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  differentButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
});

export default CourseResultScreen;
