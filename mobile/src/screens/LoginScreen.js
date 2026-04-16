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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import { authAPI, applicationAPI } from '../services/api';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      // Check if user is not verified
      if (!user.isVerified) {
        Toast.show({
          type: 'warning',
          text1: 'Account Not Verified',
          text2: 'Please verify your email to continue',
          position: 'top',
          topOffset: 60,
          visibilityTime: 3000,
        });
        
        setTimeout(() => {
          navigation.navigate('Verification', { email: user.email });
        }, 1000);
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Welcome Back! 👋',
        text2: `Logged in as ${user.fullName}`,
        position: 'top',
        topOffset: 60,
        visibilityTime: 2000,
      });

      // Check if admin
      if (user.role === 'admin') {
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminDashboard' }],
          });
        }, 800);
        return;
      }

      // Check if user has already submitted an application
      try {
        const appResponse = await applicationAPI.getMine();
        if (appResponse.data && appResponse.data.trackingCode) {
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ 
                name: 'Feed',
                params: { trackingCode: appResponse.data.trackingCode }
              }],
            });
          }, 800);
        } else {
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Guidelines' }],
            });
          }, 800);
        }
      } catch (appError) {
        if (appError.response?.status === 404) {
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Guidelines' }],
            });
          }, 800);
        } else {
          setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Guidelines' }],
            });
          }, 800);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let message = 'Login failed. Please try again.';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message === 'Network Error') {
        message = 'Cannot connect to server. Please check if the backend is running.';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
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
            <Text style={styles.title}>Welcome Back</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </Animated.View>

          {/* Login Card */}
          <View style={styles.card}>
            <View style={styles.cardGlass} pointerEvents="none" />
            
            <View style={styles.cardContent} pointerEvents="box-none">
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
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.white + '80'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
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
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordLink}
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGradient} />
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="log-in" size={20} color={COLORS.white} />
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons name="person-add" size={18} color={COLORS.primaryLight} />
                <Text style={styles.registerText}>
                  Don't have an account? <Text style={styles.registerTextBold}>Sign Up</Text>
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
    paddingTop: 80,
    paddingHorizontal: SIZES.lg,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
    top: -10,
    left: -10,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 32,
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
    marginBottom: 20,
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
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    marginBottom: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: COLORS.primaryLight,
    ...FONTS.semiBold,
  },
  loginButton: {
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    color: COLORS.white,
    ...FONTS.bold,
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.white + '99',
    marginHorizontal: 16,
    ...FONTS.medium,
  },
  registerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
  },
  registerTextBold: {
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

export default LoginScreen;
