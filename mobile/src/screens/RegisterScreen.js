import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Animated,
  ImageBackground,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../styles/theme';
import { authAPI } from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSymbol: false,
  });
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

  // Validate password strength
  useEffect(() => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const isPasswordStrong = () => {
    return Object.values(passwordStrength).every(value => value === true);
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
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

    if (password !== confirmPassword) {
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
      const response = await authAPI.register({ fullName, email, password });
      
      Toast.show({
        type: 'success',
        text1: 'Check Your Email! 📧',
        text2: 'Verification code sent successfully',
        position: 'top',
        topOffset: 60,
      });
      
      setTimeout(() => {
        navigation.navigate('Verification', { email, fullName });
      }, 800);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      
      let message = 'Registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check if the backend is running.';
      } else if (error.code === 'ECONNABORTED') {
        message = 'Request timeout. Please check your internet connection.';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
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
            <Text style={styles.title}>Create Account</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.subtitle}>Join CTU Daanbantayan Campus</Text>
          </Animated.View>

          {/* Register Card */}
          <View style={styles.card}>
            <View style={styles.cardGlass} pointerEvents="none" />
            
            <View style={styles.cardContent} pointerEvents="box-none">
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="person" size={14} color={COLORS.white} /> Full Name
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color={COLORS.primaryLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.white + '80'}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="mail" size={14} color={COLORS.white} /> Email Address
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.primaryLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.white + '80'}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="lock-closed" size={14} color={COLORS.white} /> Password
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.primaryLight} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="At least 8 characters"
                    placeholderTextColor={COLORS.white + '80'}
                    value={password}
                    onChangeText={setPassword}
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
                
                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.strengthItem}>
                      <Ionicons 
                        name={passwordStrength.hasMinLength ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={passwordStrength.hasMinLength ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[
                        styles.strengthText,
                        passwordStrength.hasMinLength && styles.strengthTextValid
                      ]}>
                        At least 8 characters
                      </Text>
                    </View>
                    <View style={styles.strengthItem}>
                      <Ionicons 
                        name={passwordStrength.hasUpperCase ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={passwordStrength.hasUpperCase ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[
                        styles.strengthText,
                        passwordStrength.hasUpperCase && styles.strengthTextValid
                      ]}>
                        One uppercase letter
                      </Text>
                    </View>
                    <View style={styles.strengthItem}>
                      <Ionicons 
                        name={passwordStrength.hasLowerCase ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={passwordStrength.hasLowerCase ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[
                        styles.strengthText,
                        passwordStrength.hasLowerCase && styles.strengthTextValid
                      ]}>
                        One lowercase letter
                      </Text>
                    </View>
                    <View style={styles.strengthItem}>
                      <Ionicons 
                        name={passwordStrength.hasNumber ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={passwordStrength.hasNumber ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[
                        styles.strengthText,
                        passwordStrength.hasNumber && styles.strengthTextValid
                      ]}>
                        One number
                      </Text>
                    </View>
                    <View style={styles.strengthItem}>
                      <Ionicons 
                        name={passwordStrength.hasSymbol ? "checkmark-circle" : "close-circle"} 
                        size={16} 
                        color={passwordStrength.hasSymbol ? '#4CAF50' : '#FF5252'} 
                      />
                      <Text style={[
                        styles.strengthText,
                        passwordStrength.hasSymbol && styles.strengthTextValid
                      ]}>
                        One symbol (!@#$%^&*)
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
                    placeholder="Re-enter your password"
                    placeholderTextColor={COLORS.white + '80'}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
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
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGradient} />
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color={COLORS.white} />
                    <Text style={styles.registerButtonText}>Create Account</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons name="log-in" size={18} color={COLORS.primaryLight} />
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.loginTextBold}>Sign In</Text>
                </Text>
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
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
    fontSize: 15,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
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
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    marginTop: 12,
    paddingLeft: 4,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  strengthText: {
    fontSize: 12,
    color: COLORS.white + '99',
    ...FONTS.regular,
  },
  strengthTextValid: {
    color: '#4CAF50',
  },
  registerButton: {
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
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: 0.5,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
  },
  loginTextBold: {
    color: COLORS.primaryLight,
    ...FONTS.bold,
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

export default RegisterScreen;
