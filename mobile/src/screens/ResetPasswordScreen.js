import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
  ImageBackground,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import { authAPI } from '../services/api';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSymbol: false,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setPasswordStrength({
      hasMinLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    });
  }, [newPassword]);

  const isPasswordStrong = () => {
    return Object.values(passwordStrength).every(value => value === true);
  };

  const handleResetPassword = async () => {
    if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    if (!isPasswordStrong()) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Please meet all password requirements',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword({ email, code, newPassword });
      
      Toast.show({
        type: 'success',
        text1: 'Password Reset! ✓',
        text2: 'You can now login with your new password',
        position: 'top',
        topOffset: 60,
        visibilityTime: 3000,
      });
      
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1000);
    } catch (error) {
      console.error('Reset password error:', error);
      
      let message = 'Failed to reset password. Please try again.';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check if the backend is running.';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: message,
        position: 'top',
        topOffset: 60,
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground 
        source={require('../../assets/ctubg.jpg')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} pointerEvents="none" />
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          {/* Header Section */}
          <Animated.View 
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoGlow} />
              <Image 
                source={require('../../assets/ctu.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.subtitle}>
              Enter the code sent to {email}
            </Text>
          </Animated.View>

          {/* Reset Card */}
          <View style={styles.card}>
            <View style={styles.cardGlass} pointerEvents="none" />
            
            <View style={styles.cardContent} pointerEvents="box-none">
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="key" size={14} color={COLORS.white} /> Verification Code
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="key-outline" size={20} color={COLORS.primaryLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={COLORS.white + '80'}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="lock-closed" size={14} color={COLORS.white} /> New Password
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.primaryLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="At least 8 characters"
                    placeholderTextColor={COLORS.white + '80'}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={showPassword ? "eye" : "eye-off"} 
                      size={20} 
                      color={COLORS.primaryLight} 
                    />
                  </TouchableOpacity>
                </View>
                
                {newPassword.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.strengthItem}>
                      <Ionicons 
                        name={passwordStrength.hasMinLength ? "checkmark-circle" : "close-circle"} 
                        size={14} 
                        color={passwordStrength.hasMinLength ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[styles.strengthText, passwordStrength.hasMinLength && styles.strengthTextValid]}>
                        8+ characters
                      </Text>
                    </View>
                    <View style={styles.strengthItem}>
                      <Ionicons 
                        name={passwordStrength.hasUpperCase ? "checkmark-circle" : "close-circle"} 
                        size={14} 
                        color={passwordStrength.hasUpperCase ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[styles.strengthText, passwordStrength.hasUpperCase && styles.strengthTextValid]}>
                        Uppercase
                      </Text>
                    </View>
                    <View style={styles.strengthItem}>
                      <Ionicons 
                        name={passwordStrength.hasLowerCase ? "checkmark-circle" : "close-circle"} 
                        size={14} 
                        color={passwordStrength.hasLowerCase ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[styles.strengthText, passwordStrength.hasLowerCase && styles.strengthTextValid]}>
                        Lowercase
                      </Text>
                    </View>
                    <View style={styles.strengthItem}>
                      <Ionicons 
                        name={passwordStrength.hasNumber ? "checkmark-circle" : "close-circle"} 
                        size={14} 
                        color={passwordStrength.hasNumber ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[styles.strengthText, passwordStrength.hasNumber && styles.strengthTextValid]}>
                        Number
                      </Text>
                    </View>
                    <View style={styles.strengthItem}>
                      <Ionicons 
                        name={passwordStrength.hasSymbol ? "checkmark-circle" : "close-circle"} 
                        size={14} 
                        color={passwordStrength.hasSymbol ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[styles.strengthText, passwordStrength.hasSymbol && styles.strengthTextValid]}>
                        Symbol
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="lock-closed" size={14} color={COLORS.white} /> Confirm Password
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.primaryLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter new password"
                    placeholderTextColor={COLORS.white + '80'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye" : "eye-off"} 
                      size={20} 
                      color={COLORS.primaryLight} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.resetButton, loading && styles.resetButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGradient} />
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                    <Text style={styles.resetButtonText}>Reset Password</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Animated.View 
            style={[
              styles.footer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={styles.footerText}>
              Cebu Technological University - Daanbantayan Campus
            </Text>
          </Animated.View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.88)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 70,
    paddingHorizontal: SIZES.lg,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: SIZES.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  logoGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
    top: -5,
    left: -5,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 30,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 30,
  },
  cardGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 24,
  },
  cardContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.white,
    ...FONTS.semiBold,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    height: 54,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.regular,
  },
  eyeButton: {
    padding: 8,
  },
  passwordStrengthContainer: {
    marginTop: 10,
    paddingLeft: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 12,
  },
  strengthText: {
    fontSize: 11,
    color: COLORS.white + '99',
    ...FONTS.regular,
  },
  strengthTextValid: {
    color: '#4CAF50',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 54,
    marginTop: 8,
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.white + '88',
    ...FONTS.regular,
    textAlign: 'center',
  },
});

export default ResetPasswordScreen;
