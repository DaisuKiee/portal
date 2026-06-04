import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../styles/theme';
import { profileAPI } from '../services/api';
import BiometricAuth from '../utils/biometricAuth';

const PrivacySecurityScreen = ({ navigation }) => {
  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changing, setChanging] = useState(false);

  // Security Settings States
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [dataEncryptionEnabled, setDataEncryptionEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserData(user);
        setTwoFactorEnabled(user.twoFactorEnabled || false);
      }

      // Load other settings from AsyncStorage
      const biometric = await AsyncStorage.getItem('biometricEnabled');
      const loginAlerts = await AsyncStorage.getItem('loginAlertsEnabled');
      const dataEncryption = await AsyncStorage.getItem('dataEncryptionEnabled');

      if (biometric !== null) setBiometricEnabled(biometric === 'true');
      if (loginAlerts !== null) setLoginAlertsEnabled(loginAlerts === 'true');
      if (dataEncryption !== null) setDataEncryptionEnabled(dataEncryption === 'true');
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      // Validation
      if (!currentPassword) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Current password is required',
          position: 'top',
          topOffset: 60,
        });
        return;
      }

      if (!newPassword) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'New password is required',
          position: 'top',
          topOffset: 60,
        });
        return;
      }

      if (newPassword.length < 6) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'New password must be at least 6 characters',
          position: 'top',
          topOffset: 60,
        });
        return;
      }

      if (newPassword !== confirmPassword) {
        Toast.show({
          type: 'error',
          text1: 'Validation Error',
          text2: 'Passwords do not match',
          position: 'top',
          topOffset: 60,
        });
        return;
      }

      setChanging(true);

      await profileAPI.changePassword(currentPassword, newPassword);

      // Update biometric credentials if enabled
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          await BiometricAuth.updateBiometricCredentials(user.email, newPassword);
        }
      } catch (bioError) {
        console.log('Biometric credentials update skipped:', bioError.message);
      }

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password changed successfully',
        position: 'top',
        topOffset: 60,
      });

      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Change password error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to change password',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setChanging(false);
    }
  };

  const handleToggle2FA = async (value) => {
    if (value) {
      // Enable 2FA - Navigate to setup screen
      navigation.navigate('TwoFactorSetup', { isEnabling: true });
    } else {
      // Disable 2FA
      Alert.alert(
        'Disable Two-Factor Authentication',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure. You will need to enter your password to confirm.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: () => promptPasswordForDisable2FA(),
          },
        ]
      );
    }
  };

  const promptPasswordForDisable2FA = () => {
    Alert.prompt(
      'Enter Password',
      'Please enter your password to disable 2FA',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async (password) => {
            if (!password) {
              Toast.show({
                type: 'error',
                text1: 'Password Required',
                text2: 'Please enter your password',
                position: 'top',
                topOffset: 60,
              });
              return;
            }

            try {
              await profileAPI.disable2FA(password);
              setTwoFactorEnabled(false);
              
              // Update user data
              const userJson = await AsyncStorage.getItem('user');
              if (userJson) {
                const user = JSON.parse(userJson);
                user.twoFactorEnabled = false;
                await AsyncStorage.setItem('user', JSON.stringify(user));
              }

              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Two-factor authentication disabled',
                position: 'top',
                topOffset: 60,
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to disable 2FA',
                position: 'top',
                topOffset: 60,
              });
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleToggleBiometric = async (value) => {
    try {
      if (value) {
        // Enable biometric
        const supported = await BiometricAuth.isBiometricSupported();
        const enrolled = await BiometricAuth.isBiometricEnrolled();
        
        if (!supported) {
          Toast.show({
            type: 'error',
            text1: 'Not Supported',
            text2: 'Biometric authentication is not supported on this device',
            position: 'top',
            topOffset: 60,
          });
          return;
        }
        
        if (!enrolled) {
          Toast.show({
            type: 'error',
            text1: 'Not Enrolled',
            text2: 'Please set up fingerprint or Face ID in your device settings first',
            position: 'top',
            topOffset: 60,
          });
          return;
        }
        
        // Prompt for credentials to save
        Alert.prompt(
          'Enter Password',
          'Please enter your password to enable biometric login',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Enable',
              onPress: async (password) => {
                if (!password) {
                  Toast.show({
                    type: 'error',
                    text1: 'Password Required',
                    text2: 'Please enter your password',
                    position: 'top',
                    topOffset: 60,
                  });
                  return;
                }
                
                try {
                  // Get user email
                  const userJson = await AsyncStorage.getItem('user');
                  if (!userJson) {
                    throw new Error('User not found');
                  }
                  
                  const user = JSON.parse(userJson);
                  
                  // Enable biometric with credentials
                  await BiometricAuth.enableBiometricLogin(user.email, password);
                  
                  setBiometricEnabled(true);
                  await AsyncStorage.setItem('biometricEnabled', 'true');
                  
                  Toast.show({
                    type: 'success',
                    text1: 'Biometric Enabled',
                    text2: 'You can now use biometric to login',
                    position: 'top',
                    topOffset: 60,
                  });
                } catch (error) {
                  console.error('Error enabling biometric:', error);
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.message || 'Failed to enable biometric login',
                    position: 'top',
                    topOffset: 60,
                  });
                }
              },
            },
          ],
          'secure-text'
        );
      } else {
        // Disable biometric
        try {
          await BiometricAuth.disableBiometricLogin();
          setBiometricEnabled(false);
          await AsyncStorage.setItem('biometricEnabled', 'false');
          
          Toast.show({
            type: 'success',
            text1: 'Biometric Disabled',
            text2: 'Biometric login has been disabled',
            position: 'top',
            topOffset: 60,
          });
        } catch (error) {
          console.error('Error disabling biometric:', error);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to disable biometric login',
            position: 'top',
            topOffset: 60,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling biometric:', error);
    }
  };

  const handleToggleLoginAlerts = async (value) => {
    try {
      setLoginAlertsEnabled(value);
      await AsyncStorage.setItem('loginAlertsEnabled', value.toString());
      Toast.show({
        type: 'success',
        text1: value ? 'Login Alerts Enabled' : 'Login Alerts Disabled',
        text2: value ? 'You will receive alerts for new logins' : 'Login alerts disabled',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      console.error('Error toggling login alerts:', error);
    }
  };

  const handleToggleDataEncryption = async (value) => {
    try {
      setDataEncryptionEnabled(value);
      await AsyncStorage.setItem('dataEncryptionEnabled', value.toString());
      Toast.show({
        type: 'success',
        text1: value ? 'Data Encryption Enabled' : 'Data Encryption Disabled',
        text2: value ? 'Your data will be encrypted at rest' : 'Data encryption disabled',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      console.error('Error toggling data encryption:', error);
    }
  };

  const handleViewActiveSessions = () => {
    navigation.navigate('ActiveSessions');
  };

  const handleViewLoginHistory = () => {
    navigation.navigate('LoginHistory');
  };

  const handleViewBackupCodes = async () => {
    try {
      const response = await profileAPI.getBackupCodes();
      const codes = response.data.backupCodes;
      
      const unusedCodes = codes.filter(bc => !bc.used);
      const usedCodes = codes.filter(bc => bc.used);
      
      let message = 'Unused Codes:\n';
      unusedCodes.forEach((bc, index) => {
        message += `${index + 1}. ${bc.code}\n`;
      });
      
      if (usedCodes.length > 0) {
        message += `\n${usedCodes.length} code(s) already used`;
      }
      
      Alert.alert(
        'Backup Codes',
        message,
        [
          {
            text: 'Regenerate Codes',
            onPress: () => handleRegenerateBackupCodes(),
          },
          {
            text: 'Close',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to load backup codes',
        position: 'top',
        topOffset: 60,
      });
    }
  };

  const handleRegenerateBackupCodes = () => {
    Alert.prompt(
      'Enter Password',
      'Please enter your password to regenerate backup codes',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Regenerate',
          onPress: async (password) => {
            if (!password) {
              Toast.show({
                type: 'error',
                text1: 'Password Required',
                text2: 'Please enter your password',
                position: 'top',
                topOffset: 60,
              });
              return;
            }

            try {
              const response = await profileAPI.regenerateBackupCodes(password);
              const newCodes = response.data.backupCodes;
              
              let message = 'New Backup Codes:\n\n';
              newCodes.forEach((code, index) => {
                message += `${index + 1}. ${code}\n`;
              });
              message += '\nSave these codes in a safe place!';
              
              Alert.alert('Backup Codes Regenerated', message);
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Failed to regenerate codes',
                position: 'top',
                topOffset: 60,
              });
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download Your Data',
      'We will prepare a copy of your data and send it to your email address. This may take a few minutes.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Request Download',
          onPress: async () => {
            try {
              const response = await profileAPI.requestDataExport();
              Toast.show({
                type: 'success',
                text1: 'Data Export Requested',
                text2: `Your data will be sent to ${response.data.email}`,
                position: 'top',
                topOffset: 60,
                visibilityTime: 5000,
              });
            } catch (error) {
              console.error('Data export error:', error);
              Toast.show({
                type: 'error',
                text1: 'Export Failed',
                text2: error.response?.data?.message || 'Failed to export data',
                position: 'top',
                topOffset: 60,
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => promptForAccountDeletion(),
        },
      ]
    );
  };

  const promptForAccountDeletion = () => {
    Alert.prompt(
      'Enter Password',
      'Please enter your password to confirm account deletion',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Next',
          style: 'destructive',
          onPress: (password) => {
            if (!password) {
              Toast.show({
                type: 'error',
                text1: 'Password Required',
                text2: 'Please enter your password',
                position: 'top',
                topOffset: 60,
              });
              return;
            }
            promptForConfirmationText(password);
          },
        },
      ],
      'secure-text'
    );
  };

  const promptForConfirmationText = (password) => {
    Alert.prompt(
      'Final Confirmation',
      'Type "DELETE MY ACCOUNT" to confirm permanent deletion',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async (confirmation) => {
            if (confirmation !== 'DELETE MY ACCOUNT') {
              Toast.show({
                type: 'error',
                text1: 'Confirmation Failed',
                text2: 'Please type exactly: DELETE MY ACCOUNT',
                position: 'top',
                topOffset: 60,
              });
              return;
            }

            try {
              const response = await profileAPI.deleteAccount(password, confirmation);
              
              // Clear all local data
              await AsyncStorage.clear();
              
              // Clear biometric credentials
              try {
                await BiometricAuth.disableBiometricLogin();
              } catch (bioError) {
                console.log('Biometric cleanup skipped:', bioError.message);
              }

              Alert.alert(
                'Account Deleted',
                `Your account has been permanently deleted. A confirmation email has been sent to ${response.data.email}`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to login screen
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Delete account error:', error);
              Toast.show({
                type: 'error',
                text1: 'Deletion Failed',
                text2: error.response?.data?.message || 'Failed to delete account',
                position: 'top',
                topOffset: 60,
              });
            }
          },
        },
      ],
      'plain-text'
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.6}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy & Security</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Change Password Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Change Password</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Update your password to keep your account secure
          </Text>

          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.passwordField}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={COLORS.mediumGray}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showCurrentPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.mediumGray}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.passwordField}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={COLORS.mediumGray}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.mediumGray}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>At least 6 characters</Text>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.passwordInput}>
              <TextInput
                style={styles.passwordField}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={COLORS.mediumGray}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.mediumGray}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Change Password Button */}
          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangePassword}
            disabled={changing}
            activeOpacity={0.7}
          >
            {changing ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.changeButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Security Tips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
            <Text style={styles.sectionTitle}>Security Tips</Text>
          </View>
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Use a strong, unique password</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Don't share your password with anyone</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Change your password regularly</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.tipText}>Log out from shared devices</Text>
            </View>
          </View>
        </View>

        {/* Two-Factor Authentication */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-half" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Add an extra layer of security by requiring a code from your authenticator app
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait" size={24} color={COLORS.secondary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Authenticator App</Text>
                <Text style={styles.settingDesc}>
                  {twoFactorEnabled ? 'Enabled' : 'Use an app to generate codes'}
                </Text>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggle2FA}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          {twoFactorEnabled && (
            <TouchableOpacity
              style={styles.linkButton}
              onPress={handleViewBackupCodes}
              activeOpacity={0.7}
            >
              <Text style={styles.linkButtonText}>View Backup Codes</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Biometric Authentication */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="finger-print" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Biometric Authentication</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Use fingerprint or face recognition to quickly and securely access your account
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="finger-print-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Fingerprint / Face ID</Text>
                <Text style={styles.settingDesc}>
                  {biometricEnabled ? 'Enabled' : 'Quick login with biometrics'}
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        {/* Login Security */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="log-in" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Login Security</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Monitor and manage your login activity
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Login Alerts</Text>
                <Text style={styles.settingDesc}>
                  {loginAlertsEnabled ? 'Get notified of new logins' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={loginAlertsEnabled}
              onValueChange={handleToggleLoginAlerts}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleViewActiveSessions}
            activeOpacity={0.7}
          >
            <Ionicons name="desktop-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.linkButtonText}>Active Sessions</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleViewLoginHistory}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.linkButtonText}>Login History</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
        </View>

        {/* Data Privacy */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-lock" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Data Privacy</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Control how your data is stored and used
          </Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="lock-closed-outline" size={24} color={COLORS.secondary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Data Encryption</Text>
                <Text style={styles.settingDesc}>
                  {dataEncryptionEnabled ? 'Your data is encrypted' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={dataEncryptionEnabled}
              onValueChange={handleToggleDataEncryption}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleDownloadData}
            activeOpacity={0.7}
          >
            <Ionicons name="download-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.linkButtonText}>Download Your Data</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            activeOpacity={0.7}
          >
            <Ionicons name="document-text-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.linkButtonText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-outline" size={20} color={COLORS.secondary} />
            <Text style={styles.linkButtonText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.mediumGray} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, styles.dangerSection]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={24} color={COLORS.error} />
            <Text style={[styles.sectionTitle, { color: COLORS.error }]}>Danger Zone</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Irreversible actions that affect your account
          </Text>

          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.dangerButtonText}>Delete Account</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 8,
    borderBottomColor: COLORS.ultraLightGray,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: COLORS.secondary,
    ...FONTS.bold,
  },
  sectionDesc: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
  },
  passwordField: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  eyeButton: {
    padding: 12,
  },
  inputHint: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginTop: 4,
  },
  changeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  changeButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  tipsList: {
    gap: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ultraLightGray,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.ultraLightGray,
  },
  linkButtonText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.regular,
  },
  dangerSection: {
    backgroundColor: '#FFF5F5',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
  },
  dangerButtonText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.error,
    ...FONTS.semiBold,
  },
});

export default PrivacySecurityScreen;
