import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, FONTS, SIZES } from '../styles/theme';

const documents = [
  { id: 1, name: 'Form 138 (Report Card)', desc: 'Original copy from Senior High School' },
  { id: 2, name: 'Certificate of Good Moral Character', desc: 'From last school attended' },
  { id: 3, name: 'PSA Birth Certificate', desc: 'Original or authenticated copy' },
  { id: 4, name: '2x2 ID Photos', desc: '4 pieces, white background, recent' },
  { id: 5, name: 'Certificate of Transfer / Honorable Dismissal', desc: 'For transferees only' },
  { id: 6, name: 'Barangay Clearance', desc: 'From your current barangay' },
  { id: 7, name: 'Medical Certificate', desc: 'From a licensed physician' },
];

const FormStep4 = ({ data, onUpdate }) => {
  const [checkedDocs, setCheckedDocs] = useState(data.checkedDocs || {});

  const toggleDoc = (id) => {
    const updated = { ...checkedDocs, [id]: !checkedDocs[id] };
    setCheckedDocs(updated);
    onUpdate({ ...data, checkedDocs: updated, documentsAcknowledged: true });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Document Requirements</Text>
      <Text style={styles.sectionDesc}>
        Please prepare the following documents. You will need to submit these to the registrar's office.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>ℹ️</Text>
        <Text style={styles.infoText}>
          Check each document you have ready. You can still proceed if you don't have all documents yet — 
          just make sure to prepare them before your scheduled enrollment.
        </Text>
      </View>

      {documents.map((doc) => (
        <TouchableOpacity
          key={doc.id}
          style={[
            styles.docItem,
            checkedDocs[doc.id] && styles.docItemChecked,
          ]}
          onPress={() => toggleDoc(doc.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            checkedDocs[doc.id] && styles.checkboxChecked,
          ]}>
            {checkedDocs[doc.id] && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.docInfo}>
            <Text style={[
              styles.docName,
              checkedDocs[doc.id] && styles.docNameChecked,
            ]}>
              {doc.name}
            </Text>
            <Text style={styles.docDesc}>{doc.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.noteBox}>
        <Text style={styles.noteTitle}>📝 Important Note</Text>
        <Text style={styles.noteText}>
          Incomplete documents may delay your enrollment. Please prepare all required documents as early as possible.
        </Text>
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
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e8f4fd',
    borderRadius: SIZES.borderRadiusSm,
    padding: 12,
    marginBottom: SIZES.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#1565c0',
    ...FONTS.regular,
    lineHeight: 17,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusSm,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  docItemChecked: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '08',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  checkmark: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.bold,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 2,
  },
  docNameChecked: {
    color: COLORS.success,
  },
  docDesc: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  noteBox: {
    backgroundColor: '#fff8e1',
    borderRadius: SIZES.borderRadiusSm,
    padding: 14,
    marginTop: SIZES.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  noteTitle: {
    fontSize: 14,
    color: '#f57f17',
    ...FONTS.semiBold,
    marginBottom: 4,
  },
  noteText: {
    fontSize: 12,
    color: '#795548',
    ...FONTS.regular,
    lineHeight: 17,
  },
});

export default FormStep4;
