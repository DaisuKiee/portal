import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../styles/theme';

const FormStep5 = ({ personalInfo, educationalBackground, familyBackground, preferredCourse }) => {
  const renderField = (label, value) => {
    if (!value) return null;
    return (
      <View style={styles.fieldRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldValue}>{value}</Text>
      </View>
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Review Your Application</Text>
      <Text style={styles.sectionDesc}>
        Please review all information before submitting. Make sure everything is accurate.
      </Text>

      <View style={styles.warningBox}>
        <Text style={styles.warningIcon}>⚠️</Text>
        <Text style={styles.warningText}>
          Once submitted, you will not be able to edit your application. Please double-check all information.
        </Text>
      </View>

      {/* Preferred Course */}
      {preferredCourse && (
        <View style={styles.courseHighlight}>
          <Text style={styles.courseLabel}>Preferred Course</Text>
          <Text style={styles.courseValue}>{preferredCourse}</Text>
        </View>
      )}

      {/* Personal Info */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewIcon}>👤</Text>
          <Text style={styles.reviewTitle}>Personal Information</Text>
        </View>
        {renderField('Name', `${personalInfo?.firstName || ''} ${personalInfo?.middleName || ''} ${personalInfo?.lastName || ''} ${personalInfo?.suffix || ''}`.trim())}
        {renderField('Birth Date', personalInfo?.birthDate)}
        {renderField('Birth Place', personalInfo?.birthPlace)}
        {renderField('Gender', personalInfo?.gender)}
        {renderField('Civil Status', personalInfo?.civilStatus)}
        {renderField('Contact', personalInfo?.contactNumber)}
        {renderField('Email', personalInfo?.email)}
        {renderField('Nationality', personalInfo?.nationality)}
        {renderField('Religion', personalInfo?.religion)}
        {personalInfo?.address && renderField('Address', 
          `${personalInfo.address.street || ''}, ${personalInfo.address.barangay || ''}, ${personalInfo.address.municipality || ''}, ${personalInfo.address.province || ''} ${personalInfo.address.zipCode || ''}`.replace(/^,\s*|,\s*$/g, '').trim()
        )}
      </View>

      {/* Educational Background */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewIcon}>🎓</Text>
          <Text style={styles.reviewTitle}>Educational Background</Text>
        </View>
        {renderField('School', educationalBackground?.lastSchoolAttended)}
        {renderField('School Address', educationalBackground?.schoolAddress)}
        {renderField('School Type', educationalBackground?.schoolType)}
        {renderField('Year Graduated', educationalBackground?.yearGraduated)}
        {renderField('LRN', educationalBackground?.lrnNumber)}
        {renderField('Strand', educationalBackground?.strand)}
        {renderField('General Average', educationalBackground?.generalAverage)}
        {renderField('Awards', educationalBackground?.awards)}
      </View>

      {/* Family Background */}
      <View style={styles.reviewSection}>
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewIcon}>👨‍👩‍👧</Text>
          <Text style={styles.reviewTitle}>Family Background</Text>
        </View>
        {renderField("Father's Name", familyBackground?.father?.fullName)}
        {renderField("Father's Occupation", familyBackground?.father?.occupation)}
        {renderField("Father's Contact", familyBackground?.father?.contactNumber)}
        {renderField("Mother's Name", familyBackground?.mother?.fullName)}
        {renderField("Mother's Occupation", familyBackground?.mother?.occupation)}
        {renderField("Mother's Contact", familyBackground?.mother?.contactNumber)}
        {familyBackground?.guardian?.fullName && renderField("Guardian", familyBackground.guardian.fullName)}
        {renderField('No. of Siblings', familyBackground?.numberOfSiblings?.toString())}
        {renderField('Annual Income', familyBackground?.annualFamilyIncome)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginBottom: SIZES.md,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3cd',
    borderRadius: SIZES.borderRadiusSm,
    padding: 12,
    marginBottom: SIZES.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    ...FONTS.medium,
    lineHeight: 17,
  },
  courseHighlight: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.borderRadiusSm,
    padding: 14,
    marginBottom: SIZES.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    alignItems: 'center',
  },
  courseLabel: {
    fontSize: 12,
    color: COLORS.primary,
    ...FONTS.semiBold,
    marginBottom: 4,
  },
  courseValue: {
    fontSize: 18,
    color: COLORS.primary,
    ...FONTS.bold,
  },
  reviewSection: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusSm,
    padding: 14,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  reviewIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  reviewTitle: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  fieldRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  fieldLabel: {
    flex: 1,
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.medium,
  },
  fieldValue: {
    flex: 1.5,
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
});

export default FormStep5;
