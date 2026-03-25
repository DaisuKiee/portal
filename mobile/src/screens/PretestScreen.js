import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { pretestAPI } from '../services/api';

const PretestScreen = ({ navigation }) => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    startPretest();
  }, []);

  const animateIn = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const startPretest = async () => {
    setLoading(true);
    try {
      const response = await pretestAPI.start();
      setCurrentQuestion(response.data.response);
      setConversationHistory(response.data.conversationHistory);
      animateIn();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to start pretest. Please try again.',
        position: 'top',
        topOffset: 60,
      });
      console.error('Pretest start error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (choice) => {
    setSelectedAnswer(choice);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) {
      Toast.show({
        type: 'warning',
        text1: 'Please Select an Answer',
        text2: 'Choose one of the options below to continue.',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setSubmitting(true);
    try {
      const answerText = `${selectedAnswer.key}. ${selectedAnswer.text}`;
      
      const response = await pretestAPI.answer({
        answer: answerText,
        conversationHistory,
      });

      const aiResponse = response.data.response;
      const updatedHistory = response.data.conversationHistory;

      // Save the answered question
      setAnsweredQuestions(prev => [
        ...prev,
        {
          question: currentQuestion.question,
          answer: selectedAnswer,
        },
      ]);

      setConversationHistory(updatedHistory);

      if (aiResponse.type === 'result') {
        // Navigate to course result screen
        navigation.navigate('CourseResult', {
          result: aiResponse,
          pretestAnswers: [
            ...answeredQuestions,
            { question: currentQuestion.question, answer: selectedAnswer },
          ],
        });
      } else {
        // Show next question
        setCurrentQuestion(aiResponse);
        setSelectedAnswer(null);
        animateIn();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to process your answer. Please try again.',
        position: 'top',
        topOffset: 60,
      });
      console.error('Answer error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    Toast.show({
      type: 'confirm',
      text1: 'Skip Pretest',
      text2: 'Are you sure you want to skip? The pretest helps our team recommend the best course for you.',
      position: 'top',
      topOffset: 60,
      visibilityTime: 6000,
      props: {
        onConfirm: () => navigation.navigate('AdmissionForm', { selectedCourse: null }),
        onCancel: () => {},
        confirmText: 'Skip',
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Preparing your pretest...</Text>
        <Text style={styles.loadingSubtext}>Our team is getting ready to help you find the best course</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admission Portal</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleRow}>
              <Ionicons name="bulb-outline" size={22} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.progressTitle}>Course Pretest</Text>
            </View>
            {currentQuestion && (
              <Text style={styles.progressCount}>
                Question {currentQuestion.questionNumber || (answeredQuestions.length + 1)} of{' '}
                {currentQuestion.totalQuestions || 6}
              </Text>
            )}
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((currentQuestion?.questionNumber || answeredQuestions.length + 1) /
                      (currentQuestion?.totalQuestions || 6)) *
                    100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressHint}>
            Answer the following questions to help our team recommend the best course for you
          </Text>
        </View>

        {/* Question Card */}
        {currentQuestion && (
          <Animated.View style={[styles.questionCard, { opacity: fadeAnim }]}>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>
                Q{currentQuestion.questionNumber || answeredQuestions.length + 1}
              </Text>
            </View>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.choicesContainer}>
              {currentQuestion.choices?.map((choice, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.choiceButton,
                    selectedAnswer?.key === choice.key && styles.choiceButtonSelected,
                  ]}
                  onPress={() => handleAnswerSelect(choice)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.choiceKey,
                      selectedAnswer?.key === choice.key && styles.choiceKeySelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceKeyText,
                        selectedAnswer?.key === choice.key && styles.choiceKeyTextSelected,
                      ]}
                    >
                      {choice.key}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.choiceText,
                      selectedAnswer?.key === choice.key && styles.choiceTextSelected,
                    ]}
                  >
                    {choice.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedAnswer && styles.submitButtonDisabled,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmitAnswer}
          disabled={!selectedAnswer || submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <View style={styles.submitLoadingRow}>
              <ActivityIndicator color={COLORS.white} size="small" />
              <Text style={styles.submitButtonText}>  Analyzing...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {(currentQuestion?.questionNumber || answeredQuestions.length + 1) >=
              (currentQuestion?.totalQuestions || 6)
                ? 'Get Recommendation'
                : 'Next Question →'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Previous Answers */}
        {answeredQuestions.length > 0 && (
          <View style={styles.previousSection}>
            <Text style={styles.previousTitle}>Your Answers</Text>
            {answeredQuestions.map((item, index) => (
              <View key={index} style={styles.previousItem}>
                <Text style={styles.previousQ}>
                  Q{index + 1}: {item.question}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.previousA}>
                    {item.answer.key}. {item.answer.text}
                  </Text>
                </View>
              </View>
            ))}
          </View>
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
    padding: SIZES.xl,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginTop: SIZES.lg,
  },
  loadingSubtext: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    backgroundColor: COLORS.secondary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: SIZES.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: COLORS.white,
    ...FONTS.bold,
  },
  skipButton: {
    fontSize: 14,
    color: COLORS.primaryLight,
    ...FONTS.semiBold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.md,
    paddingBottom: SIZES.xxl,
  },
  progressSection: {
    marginBottom: SIZES.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  progressCount: {
    fontSize: 13,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressHint: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.lg,
    ...SHADOWS.medium,
    marginBottom: SIZES.md,
  },
  questionBadge: {
    backgroundColor: COLORS.primary + '15',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  questionBadgeText: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  questionText: {
    fontSize: 17,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    lineHeight: 24,
    marginBottom: SIZES.lg,
  },
  choicesContainer: {
    gap: 10,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.borderRadius,
    padding: 14,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    marginBottom: 2,
  },
  choiceButtonSelected: {
    backgroundColor: COLORS.primary + '10',
    borderColor: COLORS.primary,
  },
  choiceKey: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  choiceKeySelected: {
    backgroundColor: COLORS.primary,
  },
  choiceKeyText: {
    fontSize: 14,
    color: COLORS.darkGray,
    ...FONTS.bold,
  },
  choiceKeyTextSelected: {
    color: COLORS.white,
  },
  choiceText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.darkGray,
    ...FONTS.medium,
    lineHeight: 20,
  },
  choiceTextSelected: {
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    height: SIZES.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
    marginBottom: SIZES.lg,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
  },
  previousSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    ...SHADOWS.small,
  },
  previousTitle: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.semiBold,
    marginBottom: 10,
  },
  previousItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  previousQ: {
    fontSize: 13,
    color: COLORS.darkGray,
    ...FONTS.medium,
    marginBottom: 4,
  },
  previousA: {
    fontSize: 13,
    color: COLORS.success,
    ...FONTS.semiBold,
    paddingLeft: 16,
  },
});

export default PretestScreen;
