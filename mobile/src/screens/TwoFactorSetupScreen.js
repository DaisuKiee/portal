import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS } from '../styles/theme';
import { profileAPI } from '../services/api';

const TwoFactorSetupScreen = ({ navigation, route }) => {
  const { isEnabling } = route.params || {};
  
  const [step, setStep] = useState(1); // 1: QR Code, 2: Verify, 3: Backup Codes
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (isEnabling) {
      initiate2FASetup();
    }
  }, []);

  const initiate2FASetup = async () => {
    try {
      setLoading(true);
      const response = await profileAPI.enable2FA();
      
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setBackupCodes(response.data.backupCodes);
      setStep(1);
    } catch (error) {
      console.error('2FA setup error:', error);
      Toast.show({
        type: 'error',
        text1: 'Setup Failed',
        text2: error.response?.data?.message || 'Failed to initiate 2FA setup',
        position: 'top',
        topOffset: 60,
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter a 6-digit code',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    try {
      setVerifying(true);
      await profileAPI.verify2FA(verificationCode);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: '2FA enabled successfully',
        position: 'top',
        topOffset: 60,
      });

      // Update user data in AsyncStorage
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        user.twoFactorEnabled = true;
        await AsyncStorage.setItem('user', JSON.stringify(user));
      }

      setStep(3); // Show backup codes
    } catch (error) {
      console.error('Verification error:', error);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.response?.data?.message || 'Invalid verification code',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleComplete = () => {
    Alert.alert(
      'Important',
      'Make sure you have saved your backup codes. You will need them if you lose access to your authenticator app.',
      [
        {
          text: 'I have saved them',
          onPress: () => navigation.goBack(),
        },
      ]
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
          <Text style={styles.headerTitle}>Setup 2FA</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Setting up 2FA...</Text>
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
        <Text style={styles.headerTitle}>Setup 2FA</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]}>
              {step > 1 ? (
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              ) : (
                <Text style={styles.progressNumber}>1</Text>
              )}
            </View>
            <Text style={styles.progressLabel}>Scan QR</Text>
          </View>
          <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]}>
              {step > 2 ? (
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              ) : (
                <Text style={styles.progressNumber}>2</Text>
              )}
            </View>
            <Text style={styles.progressLabel}>Verify</Text>
          </View>
          <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]}>
              <Text style={styles.progressNumber}>3</Text>
            </View>
            <Text style={styles.progressLabel}>Backup</Text>
          </View>
        </View>

        {/* Step 1: Scan QR Code */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons name="qr-code" size={32} color={COLORS.primary} />
              <Text style={styles.stepTitle}>Scan QR Code</Text>
            </View>
            <Text style={styles.stepDesc}>
              Open your authenticator app (Google Authenticator, Microsoft Authenticator, or Authy) and scan this QR code.
            </Text>

            {qrCode && (
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: qrCode }}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.manualEntry}>
              <Text style={styles.manualEntryTitle}>Can't scan?</Text>
              <Text style={styles.manualEntryDesc}>
                Enter this code manually in your authenticator app:
              </Text>
              <View style={styles.secretBox}>
                <Text style={styles.secretText}>{secret}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setStep(2)}
              activeOpacity={0.7}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Verify Code */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
              <Text style={styles.stepTitle}>Verify Code</Text>
            </View>
            <Text style={styles.stepDesc}>
              Enter the 6-digit code from your authenticator app to verify the setup.
            </Text>

            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                value={verificationCode}
                onChangeText={setVerificationCode}
                placeholder="000000"
                placeholderTextColor={COLORS.mediumGray}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, verifying && styles.verifyButtonDisabled]}
              onPress={handleVerify}
              disabled={verifying}
              activeOpacity={0.7}
            >
              {verifying ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify & Enable</Text>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => setStep(1)}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
              <Text style={styles.backLinkText}>Back to QR Code</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Backup Codes */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Ionicons name="key" size={32} color={COLORS.success} />
              <Text style={styles.stepTitle}>Backup Codes</Text>
            </View>
            <Text style={styles.stepDesc}>
              Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
            </Text>

            <View style={styles.warningBox}>
              <Ionicons name="warning" size={20} color={COLORS.warning} />
              <Text style={styles.warningText}>
                Each code can only be used once. Store them securely!
              </Text>
            </View>

            <View style={styles.codesContainer}>
              {backupCodes.map((code, index) => (
                <View key={index} style={styles.codeItem}>
                  <Text style={styles.codeNumber}>{index + 1}.</Text>
                  <Text style={styles.codeText}>{code}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleComplete}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-done" size={20} color={COLORS.white} />
              <Text style={styles.completeButtonText}>I've Saved My Codes</Text>
            </TouchableOpacity>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  content: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
  },
  progressNumber: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.mediumGray,
    ...FONTS.regular,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 8,
    marginBottom: 28,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepContainer: {
    padding: 20,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginTop: 12,
  },
  stepDesc: {
    fontSize: 15,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    marginBottom: 30,
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  manualEntry: {
    marginBottom: 30,
  },
  manualEntryTitle: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 8,
  },
  manualEntryDesc: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    marginBottom: 12,
  },
  secretBox: {
    backgroundColor: COLORS.ultraLightGray,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  secretText: {
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.mono,
    textAlign: 'center',
    letterSpacing: 2,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  codeInputContainer: {
    marginBottom: 30,
  },
  codeInput: {
    fontSize: 32,
    color: COLORS.secondary,
    ...FONTS.bold,
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    letterSpacing: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  backLinkText: {
    fontSize: 14,
    color: COLORS.primary,
    ...FONTS.regular,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.warning,
    marginBottom: 20,
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    lineHeight: 20,
  },
  codesContainer: {
    backgroundColor: COLORS.ultraLightGray,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    marginBottom: 30,
  },
  codeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  codeNumber: {
    fontSize: 14,
    color: COLORS.mediumGray,
    ...FONTS.regular,
    width: 30,
  },
  codeText: {
    fontSize: 16,
    color: COLORS.secondary,
    ...FONTS.mono,
    letterSpacing: 2,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.semiBold,
  },
});

export default TwoFactorSetupScreen;
