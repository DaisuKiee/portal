import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image, ImageBackground } from 'react-native';
import { COLORS, FONTS } from '../styles/theme';

const Preloader = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fade in after logo
    Animated.timing(textFadeAnim, {
      toValue: 1,
      duration: 800,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Continuous rotation for loading ring
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for dots
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
          duration: 900,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <ImageBackground
      source={require('../../assets/ctubg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay for better contrast */}
      <View style={styles.overlay} />

      {/* Animated gradient overlays */}
      <Animated.View style={[styles.gradientTop, { opacity: shimmerOpacity }]} />
      <Animated.View style={[styles.gradientBottom, { opacity: shimmerOpacity }]} />

      {/* Main content */}
      <View style={styles.content}>
        {/* Logo container with animated rings */}
        <View style={styles.logoContainer}>
          {/* Outer ring */}
          <Animated.View
            style={[
              styles.loadingRingOuter,
              {
                transform: [{ rotate: spin }],
                opacity: fadeAnim,
              },
            ]}
          />
          
          {/* Inner ring - rotates opposite direction */}
          <Animated.View
            style={[
              styles.loadingRingInner,
              {
                transform: [{ 
                  rotate: spinValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['360deg', '0deg'],
                  })
                }],
                opacity: fadeAnim,
              },
            ]}
          />
          
          <Animated.View
            style={[
              styles.logoWrapper,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <View style={styles.logoBackground}>
              <Image
                source={require('../../assets/ctu.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
        </View>

        {/* Text content */}
        <Animated.View
          style={[
            styles.textContainer,
            { opacity: textFadeAnim },
          ]}
        >
          <Text style={styles.title}>CTU Admission Portal</Text>
          <View style={styles.dividerLine} />
          <Text style={styles.subtitle}>Cebu Technological University</Text>
          <Text style={styles.campus}>Daanbantayan Campus</Text>
        </Animated.View>

        {/* Loading indicator */}
        <Animated.View 
          style={[
            styles.loadingContainer,
            { opacity: textFadeAnim },
          ]}
        >
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [{ 
                    scale: pulseAnim.interpolate({
                      inputRange: [1, 1.4],
                      outputRange: [1, 1.4],
                    })
                  }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>Initializing...</Text>
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View
        style={[
          styles.footer,
          { opacity: textFadeAnim },
        ]}
      >
        <View style={styles.footerContent}>
          <Text style={styles.footerText}>Powered by CTU</Text>
          <View style={styles.footerDot} />
          <Text style={styles.version}>v1.0.0</Text>
        </View>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
  },
  gradientTop: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.primary + '20',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: COLORS.primary + '15',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 50,
  },
  loadingRingOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: COLORS.primary,
    borderRightColor: COLORS.primary + '60',
    top: -20,
    left: -20,
  },
  loadingRingInner: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    borderColor: 'transparent',
    borderBottomColor: COLORS.primaryLight,
    borderLeftColor: COLORS.primaryLight + '60',
    top: -5,
    left: -5,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoBackground: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    borderWidth: 4,
    borderColor: COLORS.primary + '20',
  },
  logo: {
    width: 130,
    height: 130,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    color: COLORS.white,
    ...FONTS.bold,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dividerLine: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.primaryLight,
    ...FONTS.semiBold,
    marginBottom: 6,
    textAlign: 'center',
  },
  campus: {
    fontSize: 14,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.white + 'DD',
    ...FONTS.medium,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    width: '100%',
    zIndex: 1,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.white + 'AA',
    ...FONTS.medium,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  version: {
    fontSize: 13,
    color: COLORS.white + '88',
    ...FONTS.regular,
  },
});

export default Preloader;
