import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

const FormStep1 = ({ data, onUpdate }) => {
  const [focusedField, setFocusedField] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (data.birthDate) {
      const [month, day, year] = data.birthDate.split('/');
      return new Date(year, month - 1, day);
    }
    return new Date(2000, 0, 1); // Default to Jan 1, 2000
  });
  const [openDropdown, setOpenDropdown] = useState(null);

  const genderOptions = ['Male', 'Female'];
  const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced'];

  const updateField = (field, value) => {
    onUpdate({ ...data, [field]: value });
  };

  const updateAddress = (field, value) => {
    onUpdate({
      ...data,
      address: { ...(data.address || {}), [field]: value },
    });
  };

  const handleDateChange = (_event, date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age > 0 ? age : 0;
  };

  const renderDateInput = (label, field, placeholder, icon, options = {}) => {
    const isOpen = openDropdown === field;
    
    return (
      <View style={[styles.inputGroup, options.half && styles.halfInput]}>
        <Text style={styles.label}>
          {label}
          {options.required && <Text style={styles.required}> *</Text>}
        </Text>
        <TouchableOpacity
          style={[
            styles.inputWrapper,
            isOpen && styles.inputWrapperFocused,
            data[field] && styles.inputWrapperFilled
          ]}
          onPress={() => setOpenDropdown(field)}
          activeOpacity={0.7}
        >
          <Ionicons name={icon} size={20} color={data[field] ? COLORS.primary : COLORS.mediumGray} style={styles.inputIcon} />
          <Text style={[styles.dateText, !data[field] && styles.placeholderText]}>
            {data[field] || placeholder}
          </Text>
          <Ionicons name="calendar" size={18} color={COLORS.mediumGray} />
        </TouchableOpacity>
        
        {isOpen && Platform.OS === 'ios' && (
          <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setOpenDropdown(null)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setOpenDropdown(null)}
            >
              <TouchableOpacity 
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                style={styles.datePickerModal}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <Ionicons name="calendar" size={24} color={COLORS.primary} />
                    <View>
                      <Text style={styles.modalTitle}>{label}</Text>
                      <Text style={styles.datePreview}>
                        {`${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getDate().toString().padStart(2, '0')}/${selectedDate.getFullYear()}`}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setOpenDropdown(null)}
                    style={styles.modalCloseButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={28} color={COLORS.mediumGray} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.datePickerContent}>
                  <View style={styles.dateInfoBox}>
                    <Ionicons name="information-circle" size={18} color={COLORS.info} />
                    <Text style={styles.dateInfoText}>
                      Age: {calculateAge(selectedDate)} years old
                    </Text>
                  </View>
                  
                  <View style={styles.datePickerWrapper}>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      textColor={COLORS.secondary}
                      themeVariant="light"
                    />
                  </View>
                  
                  <View style={styles.datePickerActions}>
                    <TouchableOpacity
                      style={styles.datePickerCancelButton}
                      onPress={() => setOpenDropdown(null)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.datePickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.datePickerConfirmButton}
                      onPress={() => {
                        const formattedDate = `${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getDate().toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
                        updateField('birthDate', formattedDate);
                        setOpenDropdown(null);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                      <Text style={styles.datePickerConfirmText}>Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        )}
        
        {isOpen && Platform.OS === 'android' && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(_event, date) => {
              setOpenDropdown(null);
              if (date) {
                setSelectedDate(date);
                const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
                updateField('birthDate', formattedDate);
              }
            }}
            maximumDate={new Date()}
          />
        )}
      </View>
    );
  };

  const renderDropdown = (label, field, options, placeholder, icon, opts = {}) => {
    const isOpen = openDropdown === field;
    
    return (
      <View style={[styles.inputGroup, opts.half && styles.halfInput]}>
        <Text style={styles.label}>
          {label}
          {opts.required && <Text style={styles.required}> *</Text>}
        </Text>
        <TouchableOpacity
          style={[
            styles.inputWrapper,
            isOpen && styles.inputWrapperFocused,
            data[field] && styles.inputWrapperFilled
          ]}
          onPress={() => setOpenDropdown(isOpen ? null : field)}
          activeOpacity={0.7}
        >
          <Ionicons name={icon} size={20} color={data[field] ? COLORS.primary : COLORS.mediumGray} style={styles.inputIcon} />
          <Text style={[styles.dateText, !data[field] && styles.placeholderText]}>
            {data[field] || placeholder}
          </Text>
          <Ionicons 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={18} 
            color={COLORS.mediumGray} 
          />
        </TouchableOpacity>
        
        {isOpen && (
          <Modal
            visible={isOpen}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setOpenDropdown(null)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setOpenDropdown(null)}
            >
              <TouchableOpacity 
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                style={styles.modalContent}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <Text style={styles.modalTitle}>{label}</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{options.length}</Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setOpenDropdown(null)}
                    style={styles.modalCloseButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={28} color={COLORS.mediumGray} />
                  </TouchableOpacity>
                </View>
                <ScrollView 
                  style={styles.modalScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.modalItem,
                        data[field] === option && styles.modalItemSelected
                      ]}
                      onPress={() => {
                        updateField(field, option);
                        setOpenDropdown(null);
                      }}
                    >
                      <Text style={[
                        styles.modalItemText,
                        data[field] === option && styles.modalItemTextSelected
                      ]}>
                        {option}
                      </Text>
                      {data[field] === option && (
                        <View style={styles.checkmarkContainer}>
                          <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        )}
      </View>
    );
  };

  const renderInput = (label, field, placeholder, icon, keyboardType = 'default', isAddress = false, options = {}) => (
    <View style={[styles.inputGroup, options.half && styles.halfInput]}>
      <Text style={styles.label}>
        {label}
        {options.required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[
        styles.inputWrapper,
        focusedField === field && styles.inputWrapperFocused,
        (isAddress ? data.address?.[field] : data[field]) && styles.inputWrapperFilled
      ]}>
        <Ionicons 
          name={icon} 
          size={20} 
          color={(isAddress ? data.address?.[field] : data[field]) ? COLORS.primary : COLORS.mediumGray} 
          style={styles.inputIcon} 
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.mediumGray}
          value={isAddress ? (data.address?.[field] || '') : (data[field] || '')}
          onChangeText={(text) => {
            // Auto-uppercase for name fields
            const shouldUppercase = ['firstName', 'middleName', 'lastName', 'suffix', 'birthPlace'].includes(field);
            const processedText = shouldUppercase ? text.toUpperCase() : text;
            isAddress ? updateAddress(field, processedText) : updateField(field, processedText);
          }}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          keyboardType={keyboardType}
          autoCapitalize={options.autoCapitalize || (options.uppercase ? 'characters' : 'words')}
        />
      </View>
    </View>
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="person" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.sectionDesc}>Please fill in your personal details accurately</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardSectionTitle}>Basic Information</Text>
          </View>
          
          <View style={styles.row}>
            {renderInput('First Name', 'firstName', 'BERNABE', 'person-outline', 'default', false, { required: true, half: true, uppercase: true })}
            {renderInput('Middle Name', 'middleName', 'VERACES', 'person-outline', 'default', false, { half: true, uppercase: true })}
          </View>

          <View style={styles.row}>
            {renderInput('Last Name', 'lastName', 'ROMEO', 'person-outline', 'default', false, { required: true, half: true, uppercase: true })}
            {renderInput('Suffix', 'suffix', 'JR., SR., III', 'ribbon-outline', 'default', false, { half: true, autoCapitalize: 'characters' })}
          </View>

          {renderDateInput('Date of Birth', 'birthDate', 'MM/DD/YYYY', 'calendar-outline', { required: true })}
          {renderInput('Place of Birth', 'birthPlace', 'DAANBANTAYAN, CEBU', 'location-outline', 'default', false, { required: true, uppercase: true })}

          <View style={styles.row}>
            {renderDropdown('Gender', 'gender', genderOptions, 'Select gender', 'male-female-outline', { required: true, half: true })}
            {renderDropdown('Civil Status', 'civilStatus', civilStatusOptions, 'Select status', 'heart-outline', { required: true, half: true })}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardSectionTitle}>Contact Information</Text>
          </View>
          
          {renderInput('Contact Number', 'contactNumber', '09XX XXX XXXX', 'call-outline', 'phone-pad', false, { required: true })}
          {renderInput('Email Address', 'email', 'juan.cruz@email.com', 'mail-outline', 'email-address', false, { required: true, autoCapitalize: 'none' })}

          <View style={styles.row}>
            {renderInput('Nationality', 'nationality', 'Filipino', 'flag-outline', 'default', false, { half: true })}
            {renderInput('Religion', 'religion', 'Roman Catholic', 'book-outline', 'default', false, { half: true })}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="home-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardSectionTitle}>Current Address</Text>
          </View>
          
          {renderInput('Street / Purok', 'street', 'Purok 1', 'home-outline', 'default', true)}
          {renderInput('Barangay', 'barangay', 'Poblacion', 'business-outline', 'default', true, { required: true })}
          
          <View style={styles.row}>
            {renderInput('Municipality', 'municipality', 'Daanbantayan', 'location-outline', 'default', true, { required: true, half: true })}
            {renderInput('Province', 'province', 'Cebu', 'map-outline', 'default', true, { required: true, half: true })}
          </View>

          {renderInput('Zip Code', 'zipCode', '6013', 'pin-outline', 'numeric', true)}
        </View>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          Fields marked with <Text style={styles.required}>*</Text> are required
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
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    ...SHADOWS.medium,
    marginBottom: SIZES.md,
  },
  cardSection: {
    paddingVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SIZES.sm,
  },
  cardSectionTitle: {
    color: COLORS.primary,
    ...FONTS.bold,
    paddingBottom: 6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SIZES.md,
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
  required: {
    color: COLORS.error,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    height: 52,
    ...SHADOWS.small,
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  inputWrapperFilled: {
    borderColor: COLORS.primary + '40',
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    ...FONTS.regular,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    ...FONTS.regular,
  },
  placeholderText: {
    color: COLORS.mediumGray,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
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
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.darkGray,
    ...FONTS.regular,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.lg,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '100%',
    maxHeight: '60%',
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.primary + '08',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '20',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 19,
    color: COLORS.secondary,
    ...FONTS.bold,
    letterSpacing: 0.3,
  },
  datePreview: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.semiBold,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    ...FONTS.bold,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    flexGrow: 0,
    paddingVertical: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  modalItemSelected: {
    backgroundColor: COLORS.primary + '12',
    borderWidth: 1.5,
    borderColor: COLORS.primary + '40',
  },
  modalItemText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.medium,
    lineHeight: 20,
  },
  modalItemTextSelected: {
    color: COLORS.primary,
    ...FONTS.bold,
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  datePickerModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  datePickerContent: {
    padding: 20,
    paddingTop: 10,
  },
  dateInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.info + '10',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginBottom: 10,
  },
  dateInfoText: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.medium,
  },
  datePickerWrapper: {
    height: 200,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  datePickerCancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  datePickerCancelText: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.semiBold,
  },
  datePickerConfirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    ...SHADOWS.medium,
  },
  datePickerConfirmText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
  },
});

export default FormStep1;
