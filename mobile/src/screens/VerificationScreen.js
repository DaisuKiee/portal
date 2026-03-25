import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  StatusBar,
  ImageBackground,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../styles/theme';
import { authAPI } from '../services/api';

const VerificationScreen = ({ route, navigation }) => {
  const { email, fullName } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  
  const inputRefs = useRef([]);
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

    setTimeout(() => inputRefs.current[0]?.focus(), 300);

    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((digit) => digit !== '') && text) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode = code.join('')) => {
    if (verificationCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter all 6 digits',
        position: 'top',
        topOffset: 60,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verify({ email, code: verificationCode });
      const { token, user } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      Toast.show({
        type: 'success',
        text1: 'Verified! 🎉',
        text2: 'Your account has been verified',
        position: 'top',
        topOffset: 60,
      });

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Guidelines' }],
        });
      }, 1000);
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: message,
        position: 'top',
        topOffset: 60,
      });
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) return;

    setResending(true);
    try {
      await authAPI.resendCode({ email });
      setTimer(60);
      Toast.show({
        type: 'success',
        text1: 'Code Sent! 📧',
        text2: 'A new verification code has been sent',
        position: 'top',
        topOffset: 60,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: 'Could not resend code. Please try again.',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setResending(false);
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
            <View style={styles.iconBadge}>
              <Ionicons name="mail" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.title}>Verify Your Email</Text>
            <View style={styles.titleUnderline} />
            <Text style={styles.subtitle}>
              We sent a 6-digit code to
            </Text>
            <Text style={styles.email}>{email}</Text>
          </Animated.View>

          {/* Verification Card */}
          <View style={styles.card}>
            <View style={styles.cardGlass} pointerEvents="none" />
            
            <View style={styles.cardContent} pointerEvents="box-none">
              <Text style={styles.instructionText}>Enter verification code</Text>

              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[
                      styles.codeInput,
                      digit && styles.codeInputFilled,
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!loading}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.verifyButton, loading && styles.buttonDisabled]}
                onPress={() => handleVerify()}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGradient} />
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                    <Text style={styles.verifyButtonText}>Verify Account</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>
                <TouchableOpacity
                  onPress={handleResendCode}
                  disabled={timer > 0 || resending}
                  activeOpacity={0.8}
                  style={styles.resendButtonContainer}
                >
                  <Ionicons 
                    name="refresh" 
                    size={16} 
                    color={(timer > 0 || resending) ? COLORS.white + '66' : COLORS.primaryLight} 
                  />
                  <Text
                    style={[
                      styles.resendButton,
                      (timer > 0 || resending) && styles.resendButtonDisabled,
                    ]}
                  >
                    {resending ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </View>
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
  iconBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
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
  },
  email: {
    fontSize: 15,
    color: COLORS.primaryLight,
    ...FONTS.bold,
    marginTop: 4,
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
  instructionText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.semiBold,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  codeInput: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: 24,
    ...FONTS.bold,
    textAlign: 'center',
    color: COLORS.white,
  },
  codeInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 54,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
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
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
    marginBottom: 8,
  },
  resendButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  resendButton: {
    fontSize: 14,
    color: COLORS.primaryLight,
    ...FONTS.bold,
  },
  resendButtonDisabled: {
    color: COLORS.white + '66',
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

export default VerificationScreen;
