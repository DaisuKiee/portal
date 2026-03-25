import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../styles/theme';

const FormStep2 = ({ data, onUpdate }) => {
  const updateField = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const renderInput = (label, field, placeholder, keyboardType = 'default') => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.mediumGray}
        value={data[field] || ''}
        onChangeText={(text) => updateField(field, text)}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Educational Background</Text>
      <Text style={styles.sectionDesc}>Provide your most recent educational information.</Text>

      {renderInput('Last School Attended *', 'lastSchoolAttended', 'Name of school')}
      {renderInput('School Address *', 'schoolAddress', 'Complete school address')}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>School Type *</Text>
        <View style={styles.radioRow}>
          {['public', 'private'].map((type) => (
            <View key={type} style={styles.radioOption}>
              <View
                style={[
                  styles.radioCircle,
                  data.schoolType === type && styles.radioCircleSelected,
                ]}
              >
                {data.schoolType === type && <View style={styles.radioInner} />}
              </View>
              <Text
                style={styles.radioText}
                onPress={() => updateField('schoolType', type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {renderInput('Year Graduated *', 'yearGraduated', 'e.g. 2026', 'numeric')}
      {renderInput('LRN Number *', 'lrnNumber', '12-digit LRN', 'numeric')}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>SHS Strand/Track *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. STEM, ABM, HUMSS, TVL, GAS"
          placeholderTextColor={COLORS.mediumGray}
          value={data.strand || ''}
          onChangeText={(text) => updateField('strand', text)}
        />
        <Text style={styles.hintText}>
          STEM, ABM, HUMSS, TVL, GAS, Sports, Arts & Design
        </Text>
      </View>

      {renderInput('General Average', 'generalAverage', 'e.g. 89.5', 'decimal-pad')}
      {renderInput('Awards / Honors', 'awards', 'e.g. With Honors, With High Honors')}
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
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    height: SIZES.inputHeight,
    fontSize: 15,
    color: COLORS.black,
    ...FONTS.regular,
  },
  hintText: {
    fontSize: 11,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginTop: 4,
    fontStyle: 'italic',
  },
  radioRow: {
    flexDirection: 'row',
    gap: 24,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  radioText: {
    fontSize: 15,
    color: COLORS.darkGray,
    ...FONTS.medium,
  },
});

export default FormStep2;
