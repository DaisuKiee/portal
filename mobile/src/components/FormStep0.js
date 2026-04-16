import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';

const FormStep0 = ({ data, onUpdate, courses, selectedCourse, courseName, navigation }) => {
  const [focusedField, setFocusedField] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Course to College mapping
  const courseCollegeMap = {
    'BSIT': 'College of Technology and Engineering',
    'BSIE': 'College of Technology and Engineering',
    'BIT-COMTECH': 'College of Technology and Engineering',
    'BIT-ELECTRONICS': 'College of Technology and Engineering',
    'BIT-AUTOMOTIVE': 'College of Technology and Engineering',
    'BSHM': 'College of Technology and Engineering',
    'BEED': 'College of Education',
    'BSED': 'College of Education',
    'BTLED': 'College of Education',
  };

  const categories = [
    'TRANSFEREE FROM NON CTU SCHOOL',
    'SENIOR HIGH SCHOOL GRADUATE',
    'SENIOR HIGH SCHOOL GRADUATING STUDENT',
    'SECOND COURSER',
    'TRANSFEREE FROM CTU SCHOOL',
    'RETURNEE',
    'ALS GRADUATE',
    'HIGH SCHOOL GRADUATE (OLD CURRICULUM)',
    'FOREIGN STUDENT',
    'SHIFTER'
  ];
  const colleges = ['College of Technology and Engineering', 'College of Education'];
  const sessions = ['Day', 'Evening'];

  // Auto-select college if pretest course is provided
  useEffect(() => {
    if (selectedCourse && !data.college) {
      const autoCollege = courseCollegeMap[selectedCourse];
      if (autoCollege) {
        onUpdate({ 
          ...data, 
          college: autoCollege,
          course: selectedCourse,
          courseName: courseName || ''
        });
      }
    }
  }, [selectedCourse]);

  // Filter courses based on selected college
  const getFilteredCourses = () => {
    if (!data.college) {
      return [];
    }
    
    const filtered = courses.filter(course => {
      const courseCollege = courseCollegeMap[course.code];
      return courseCollege === data.college;
    });
    
    return filtered;
  };

  const filteredCourses = getFilteredCourses();

  const updateField = (field, value) => {
    const newData = { ...data, [field]: value };
    onUpdate(newData);
  };

  const renderDropdown = (label, field, options, placeholder, icon, required = false) => {
    const isOpen = openDropdown === field;
    
    // If college field and pretest course exists, show as locked
    if (field === 'college' && selectedCourse && data.college) {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          <View style={styles.lockedDropdown}>
            <Ionicons name={icon} size={20} color={COLORS.primary} style={styles.dropdownIcon} />
            <Text style={[styles.dropdownButtonText, { color: COLORS.primary, ...FONTS.semiBold }]}>
              {data[field]}
            </Text>
            <View style={styles.pretestBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.pretestBadgeText}>Auto</Text>
            </View>
          </View>
          <Text style={styles.helperText}>
            Auto-selected based on your pretest course
          </Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.inputGroup, isOpen && { zIndex: 1000 }]}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            isOpen && styles.dropdownButtonOpen,
            data[field] && styles.dropdownButtonSelected
          ]}
          onPress={() => {
            setOpenDropdown(isOpen ? null : field);
          }}
          activeOpacity={0.7}
        >
          <Ionicons name={icon} size={20} color={data[field] ? COLORS.primary : COLORS.mediumGray} style={styles.dropdownIcon} />
          <Text style={[
            styles.dropdownButtonText,
            !data[field] && styles.dropdownPlaceholder
          ]}>
            {data[field] || placeholder}
          </Text>
          <Ionicons 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
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
                        // Batch updates for college field
                        if (field === 'college' && !selectedCourse) {
                          const newData = {
                            ...data,
                            [field]: option,
                            course: '',
                            courseName: ''
                          };
                          onUpdate(newData);
                        } else {
                          updateField(field, option);
                        }
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

  const renderCourseDropdown = () => {
    const isOpen = openDropdown === 'course';
    
    // Don't show course dropdown if no college is selected
    if (!data.college) {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Course
            <Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.disabledDropdown}>
            <Ionicons name="school-outline" size={20} color={COLORS.mediumGray} style={styles.dropdownIcon} />
            <Text style={styles.disabledText}>Please select a college first</Text>
            <Ionicons name="lock-closed" size={18} color={COLORS.mediumGray} />
          </View>
        </View>
      );
    }

    // If pretest course is selected, show it as locked
    if (selectedCourse && data.course === selectedCourse) {
      return (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Course
            <Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.lockedDropdown}>
            <Ionicons name="school-outline" size={20} color={COLORS.primary} style={styles.dropdownIcon} />
            <View style={styles.dropdownButtonContent}>
              <Text style={styles.selectedCourseCode}>{data.course}</Text>
              <Text style={styles.selectedCourseName}>{data.courseName}</Text>
            </View>
            <View style={styles.pretestBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.pretestBadgeText}>Pretest</Text>
            </View>
          </View>
          <Text style={styles.helperText}>
            This course was recommended based on your pretest results
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>
          Course
          <Text style={styles.required}> *</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            isOpen && styles.dropdownButtonOpen,
            data.course && styles.dropdownButtonSelected
          ]}
          onPress={() => setOpenDropdown(isOpen ? null : 'course')}
          activeOpacity={0.7}
        >
          <Ionicons name="school-outline" size={20} color={data.course ? COLORS.primary : COLORS.mediumGray} style={styles.dropdownIcon} />
          <View style={styles.dropdownButtonContent}>
            {data.course ? (
              <>
                <Text style={styles.selectedCourseCode}>{data.course}</Text>
                <Text style={styles.selectedCourseName}>{data.courseName}</Text>
              </>
            ) : (
              <Text style={styles.dropdownPlaceholder}>Select course</Text>
            )}
          </View>
          <Ionicons 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={20} 
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
                    <Text style={styles.modalTitle}>Select Course</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{filteredCourses.length}</Text>
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
                  {filteredCourses.map((course, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.modalItem,
                        styles.courseModalItem,
                        data.course === course.code && styles.modalItemSelected
                      ]}
                      onPress={() => {
                        const newData = {
                          ...data,
                          course: course.code,
                          courseName: course.name
                        };
                        onUpdate(newData);
                        setOpenDropdown(null);
                      }}
                    >
                      <View style={styles.courseItemContent}>
                        <Text style={[
                          styles.courseItemCode,
                          data.course === course.code && styles.courseItemCodeSelected
                        ]}>
                          {course.code}
                        </Text>
                        <Text style={[
                          styles.courseItemName,
                          data.course === course.code && styles.courseItemNameSelected
                        ]}>
                          {course.name}
                        </Text>
                        {/* Show requirements */}
                        {(course.minimumGWA || course.studentLimit) && (
                          <View style={styles.courseRequirements}>
                            {course.minimumGWA && (
                              <View style={styles.requirementBadge}>
                                <Ionicons name="trophy" size={12} color={COLORS.warning} />
                                <Text style={styles.requirementText}>Min GWA: {course.minimumGWA}</Text>
                              </View>
                            )}
                            {course.studentLimit && (
                              <View style={styles.requirementBadge}>
                                <Ionicons name="people" size={12} color={COLORS.info} />
                                <Text style={styles.requirementText}>Limit: {course.studentLimit} students</Text>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                      {data.course === course.code && (
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

  return (
    <ScrollView 
      showsVerticalScrollIndicator={false} 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="school" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.sectionTitle}>Program Application</Text>
          <Text style={styles.sectionDesc}>Select your preferred program and details</Text>
        </View>
      </View>

      {/* Back to Pretest Button */}
      <TouchableOpacity 
        style={styles.backToPretestButton}
        onPress={() => {
          if (navigation) {
            navigation.navigate('Pretest');
          }
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.backToPretestText}>Retake Pretest</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        {renderDropdown('Category', 'category', categories, 'Select category', 'list-outline', true)}
        
        {renderDropdown('College', 'college', colleges, 'Select college', 'business-outline', true)}

        <View style={styles.row}>
          <View style={styles.halfInput}>
            {renderDropdown('Session', 'session', sessions, 'Select session', 'time-outline', true)}
          </View>
          <View style={styles.halfInput}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                GWA (General Weighted Average)
                <Text style={styles.required}> *</Text>
              </Text>
              <View style={[
                styles.gwaBox,
                focusedField === 'gwa' && styles.gwaBoxFocused
              ]}>
                <Ionicons name="trophy-outline" size={20} color={COLORS.warning} style={styles.gwaIcon} />
                <TextInput
                  style={styles.gwaInput}
                  placeholder="e.g. 89.5"
                  placeholderTextColor={COLORS.mediumGray}
                  value={data.gwa || ''}
                  onChangeText={(text) => updateField('gwa', text)}
                  onFocus={() => setFocusedField('gwa')}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="decimal-pad"
                  maxLength={5}
                />
              </View>
            </View>
          </View>
        </View>

        {renderCourseDropdown()}
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          Please select all required fields before proceeding to the next step
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
  backToPretestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  backToPretestText: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.semiBold,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: SIZES.md,
    ...SHADOWS.medium,
    marginBottom: SIZES.md,
    overflow: 'visible',
  },
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 1,
  },
  label: {
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 8,
  },
  required: {
    color: COLORS.error,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 52,
    ...SHADOWS.small,
  },
  dropdownButtonOpen: {
    borderColor: COLORS.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownButtonSelected: {
    borderColor: COLORS.primary + '60',
  },
  dropdownIcon: {
    marginRight: 12,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.medium,
  },
  dropdownPlaceholder: {
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  dropdownButtonContent: {
    flex: 1,
  },
  selectedCourseCode: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 2,
  },
  selectedCourseName: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  gwaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1.5,
    borderColor: COLORS.warning + '30',
    paddingHorizontal: 12,
    height: 52,
  },
  gwaBoxFocused: {
    borderColor: COLORS.warning,
    backgroundColor: COLORS.white,
  },
  gwaIcon: {
    marginRight: 8,
  },
  gwaInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  disabledDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray + '40',
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1.5,
    borderColor: COLORS.lightGray,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 52,
  },
  disabledText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    fontStyle: 'italic',
  },
  lockedDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '08',
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1.5,
    borderColor: COLORS.success + '40',
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 52,
  },
  pretestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  pretestBadgeText: {
    fontSize: 11,
    color: COLORS.success,
    ...FONTS.semiBold,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.success,
    ...FONTS.regular,
    marginTop: 6,
    fontStyle: 'italic',
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
    maxHeight: '75%',
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
  courseModalItem: {
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  courseItemContent: {
    flex: 1,
    marginRight: 12,
  },
  courseItemCode: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  courseItemCodeSelected: {
    color: COLORS.primary,
  },
  courseItemName: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    lineHeight: 18,
  },
  courseItemNameSelected: {
    color: COLORS.primary + 'DD',
    ...FONTS.medium,
  },
  checkmarkContainer: {
    marginLeft: 8,
  },
  courseRequirements: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  requirementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  requirementText: {
    fontSize: 11,
    color: COLORS.darkGray,
    ...FONTS.medium,
  },
});

export default FormStep0;
