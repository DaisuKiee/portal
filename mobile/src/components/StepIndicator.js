import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../styles/theme';

const StepIndicator = ({ currentStep, totalSteps = 4, labels = [] }) => {
  const defaultLabels = [
    'Program Application',
    'Personal Information',
    'Uploading of Requirements',
    'Tracking Code Issuance'
  ];

  const stepIcons = [
    'school',
    'person',
    'document-text',
    'thumbs-up'
  ];

  const stepLabels = labels.length > 0 ? labels : defaultLabels;

  return (
    <View style={styles.container}>
      <View style={styles.stepsRow}>
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <React.Fragment key={stepNum}>
              {index > 0 && (
                <View
                  style={[
                    styles.line,
                    isCompleted && styles.lineCompleted,
                  ]}
                />
              )}
              <View style={styles.stepWrapper}>
                <View
                  style={[
                    styles.circle,
                    isActive && styles.circleActive,
                    isCompleted && styles.circleCompleted,
                  ]}
                >
                  <Ionicons 
                    name={stepIcons[index] || 'ellipse'} 
                    size={18} 
                    color={isActive || isCompleted ? COLORS.white : COLORS.mediumGray}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                    isCompleted && styles.labelCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {stepLabels[index] || `Step ${stepNum}`}
                </Text>
              </View>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepWrapper: {
    alignItems: 'center',
    width: 70,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.lightGray,
  },
  circleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  circleCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.lightGray,
    marginBottom: 28,
  },
  lineCompleted: {
    backgroundColor: COLORS.success,
  },
  label: {
    fontSize: 9,
    color: COLORS.mediumGray,
    marginTop: 6,
    ...FONTS.medium,
    textAlign: 'center',
  },
  labelActive: {
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  labelCompleted: {
    color: COLORS.success,
  },
});

export default StepIndicator;
