import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerificationScreen from '../screens/VerificationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import GuidelinesScreen from '../screens/GuidelinesScreen';
import PretestScreen from '../screens/PretestScreen';
import CourseResultScreen from '../screens/CourseResultScreen';
import AdmissionFormScreen from '../screens/AdmissionFormScreen';
import TrackingScreen from '../screens/TrackingScreen';
import FeedScreen from '../screens/FeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import PrivacySecurityScreen from '../screens/PrivacySecurityScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminApplicationsScreen from '../screens/AdminApplicationsScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminCoursesScreen from '../screens/AdminCoursesScreen';
import AdminPostsScreen from '../screens/AdminPostsScreen';
import AdminNotificationsScreen from '../screens/AdminNotificationsScreen';
import AdminSettingsScreen from '../screens/AdminSettingsScreen';
import AdminTrackingManagementScreen from '../screens/AdminTrackingManagementScreen';
import ApplicationDetailsScreen from '../screens/ApplicationDetailsScreen';
import { applicationAPI } from '../services/api';
import { COLORS } from '../styles/theme';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (!token) {
        // No token, go to Login
        setInitialRoute('Login');
        setIsLoading(false);
        return;
      }

      // Check if user is admin
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          // Admin users cannot access mobile app
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          Alert.alert(
            'Admin Access Restricted',
            'Admin accounts can only access the web admin panel. Please use a web browser to access the admin dashboard.',
            [{ text: 'OK' }]
          );
          setInitialRoute('Login');
          setIsLoading(false);
          return;
        }
      }

      // Regular user, check if they have an application
      try {
        const response = await applicationAPI.getMine();
        if (response.data && response.data.trackingCode) {
          // Has application, go to Feed
          setInitialRoute('Feed');
        } else {
          // No application, go to Guidelines
          setInitialRoute('Guidelines');
        }
      } catch (error) {
        if (error.response?.status === 404) {
          // No application found, go to Guidelines
          setInitialRoute('Guidelines');
        } else if (error.response?.status === 401) {
          // Token expired, go to Login
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          setInitialRoute('Login');
        } else {
          // Other error, go to Guidelines
          setInitialRoute('Guidelines');
        }
      }
    } catch (error) {
      console.error('Error checking initial route:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Guidelines" component={GuidelinesScreen} />
      <Stack.Screen name="Pretest" component={PretestScreen} />
      <Stack.Screen name="CourseResult" component={CourseResultScreen} />
      <Stack.Screen name="AdmissionForm" component={AdmissionFormScreen} />
      <Stack.Screen name="Tracking" component={TrackingScreen} />
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="PrivacySecurity" component={PrivacySecurityScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminApplications" component={AdminApplicationsScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminCourses" component={AdminCoursesScreen} />
      <Stack.Screen name="AdminPosts" component={AdminPostsScreen} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Stack.Screen name="AdminTrackingManagement" component={AdminTrackingManagementScreen} />
      <Stack.Screen name="ApplicationDetails" component={ApplicationDetailsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});

export default AppNavigator;
