import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import { courseAPI } from '../services/api';

const AdminCoursesScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const response = await courseAPI.getAll();
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Load',
        text2: 'Could not load courses',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course => 
        course.name.toLowerCase().includes(text.toLowerCase()) ||
        course.code.toLowerCase().includes(text.toLowerCase()) ||
        course.description.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredCourses(courses);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses().then(() => {
      if (searchQuery.trim() !== '') {
        handleSearch(searchQuery);
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Courses</Text>
          <Text style={styles.headerSubtitle}>Available Programs</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.mediumGray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by course name, code, or description..."
            placeholderTextColor={COLORS.mediumGray}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={COLORS.mediumGray} />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery !== '' && (
          <Text style={styles.searchResultText}>
            {filteredCourses.length} result{filteredCourses.length !== 1 ? 's' : ''} found
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {filteredCourses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={64} color={COLORS.mediumGray} />
            <Text style={styles.emptyText}>
              {searchQuery !== '' ? 'No matching courses found' : 'No courses found'}
            </Text>
            {searchQuery !== '' && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredCourses.map((course) => (
            <View key={course._id} style={styles.courseCard}>
              <View style={styles.courseHeader}>
                <View style={styles.courseIconContainer}>
                  <Ionicons name="school" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseCode}>{course.code}</Text>
                  <Text style={styles.courseName}>{course.name}</Text>
                </View>
              </View>
              <Text style={styles.courseDescription}>{course.description}</Text>
              <View style={styles.careerSection}>
                <Text style={styles.careerTitle}>Career Prospects:</Text>
                <View style={styles.careerList}>
                  {course.careerProspects.slice(0, 3).map((career, index) => (
                    <View key={index} style={styles.careerItem}>
                      <Ionicons name="briefcase" size={12} color={COLORS.mediumGray} />
                      <Text style={styles.careerText}>{career}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))
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
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.medium,
    marginTop: 12,
  },
  header: {
    backgroundColor: COLORS.secondary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
    marginTop: 2,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  searchResultText: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.medium,
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.mediumGray,
    ...FONTS.medium,
    marginTop: 16,
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  clearSearchText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.lg,
    paddingBottom: 40,
  },
  courseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  courseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.bold,
    marginBottom: 2,
  },
  courseName: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    lineHeight: 20,
  },
  courseDescription: {
    fontSize: 13,
    color: COLORS.darkGray,
    ...FONTS.regular,
    lineHeight: 19,
    marginBottom: 12,
  },
  careerSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  careerTitle: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.semiBold,
    marginBottom: 8,
  },
  careerList: {
    gap: 6,
  },
  careerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  careerText: {
    fontSize: 12,
    color: COLORS.darkGray,
    ...FONTS.regular,
  },
});

export default AdminCoursesScreen;
