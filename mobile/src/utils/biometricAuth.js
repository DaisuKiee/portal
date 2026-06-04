import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';

/**
 * Check if device supports biometric authentication
 */
export const isBiometricSupported = async () => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    return compatible;
  } catch (error) {
    console.error('Error checking biometric support:', error);
    return false;
  }
};

/**
 * Check if biometric authentication is enrolled (fingerprint/face registered)
 */
export const isBiometricEnrolled = async () => {
  try {
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return enrolled;
  } catch (error) {
    console.error('Error checking biometric enrollment:', error);
    return false;
  }
};

/**
 * Get available biometric types
 */
export const getBiometricTypes = async () => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types;
  } catch (error) {
    console.error('Error getting biometric types:', error);
    return [];
  }
};

/**
 * Get biometric type name for display
 */
export const getBiometricTypeName = async () => {
  const types = await getBiometricTypes();
  
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
    return 'Face ID';
  } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
    return 'Fingerprint';
  } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
    return 'Iris';
  }
  
  return 'Biometric';
};

/**
 * Authenticate with biometrics
 */
export const authenticateWithBiometrics = async (promptMessage = 'Authenticate to continue') => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false, // Allow PIN/password fallback
      fallbackLabel: 'Use Password',
    });
    
    return result;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if biometric login is enabled
 */
export const isBiometricLoginEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('Error checking biometric login status:', error);
    return false;
  }
};

/**
 * Enable biometric login and save credentials securely
 */
export const enableBiometricLogin = async (email, password) => {
  try {
    // Check if biometric is supported and enrolled
    const supported = await isBiometricSupported();
    const enrolled = await isBiometricEnrolled();
    
    if (!supported) {
      throw new Error('Biometric authentication is not supported on this device');
    }
    
    if (!enrolled) {
      throw new Error('No biometric data enrolled. Please set up fingerprint or Face ID in your device settings');
    }
    
    // Authenticate before saving credentials
    const authResult = await authenticateWithBiometrics('Authenticate to enable biometric login');
    
    if (!authResult.success) {
      throw new Error('Biometric authentication failed');
    }
    
    // Save credentials securely
    const credentials = JSON.stringify({ email, password });
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials);
    
    // Mark biometric login as enabled
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    
    return { success: true };
  } catch (error) {
    console.error('Error enabling biometric login:', error);
    throw error;
  }
};

/**
 * Disable biometric login and remove stored credentials
 */
export const disableBiometricLogin = async () => {
  try {
    // Remove stored credentials
    await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    
    // Mark biometric login as disabled
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
    
    return { success: true };
  } catch (error) {
    console.error('Error disabling biometric login:', error);
    throw error;
  }
};

/**
 * Get stored credentials after biometric authentication
 */
export const getBiometricCredentials = async () => {
  try {
    // Check if biometric login is enabled
    const enabled = await isBiometricLoginEnabled();
    
    if (!enabled) {
      throw new Error('Biometric login is not enabled');
    }
    
    // Authenticate with biometrics
    const authResult = await authenticateWithBiometrics('Authenticate to login');
    
    if (!authResult.success) {
      throw new Error('Biometric authentication failed');
    }
    
    // Get stored credentials
    const credentialsJson = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    
    if (!credentialsJson) {
      throw new Error('No credentials found');
    }
    
    const credentials = JSON.parse(credentialsJson);
    return { success: true, credentials };
  } catch (error) {
    console.error('Error getting biometric credentials:', error);
    throw error;
  }
};

/**
 * Check if biometric login should be shown on login screen
 */
export const shouldShowBiometricLogin = async () => {
  try {
    const enabled = await isBiometricLoginEnabled();
    const supported = await isBiometricSupported();
    const enrolled = await isBiometricEnrolled();
    
    return enabled && supported && enrolled;
  } catch (error) {
    console.error('Error checking biometric login availability:', error);
    return false;
  }
};

/**
 * Update stored credentials (when password changes)
 */
export const updateBiometricCredentials = async (email, newPassword) => {
  try {
    const enabled = await isBiometricLoginEnabled();
    
    if (!enabled) {
      return { success: true }; // Nothing to update
    }
    
    // Authenticate before updating
    const authResult = await authenticateWithBiometrics('Authenticate to update credentials');
    
    if (!authResult.success) {
      throw new Error('Biometric authentication failed');
    }
    
    // Update credentials
    const credentials = JSON.stringify({ email, password: newPassword });
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, credentials);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating biometric credentials:', error);
    throw error;
  }
};

export default {
  isBiometricSupported,
  isBiometricEnrolled,
  getBiometricTypes,
  getBiometricTypeName,
  authenticateWithBiometrics,
  isBiometricLoginEnabled,
  enableBiometricLogin,
  disableBiometricLogin,
  getBiometricCredentials,
  shouldShowBiometricLogin,
  updateBiometricCredentials,
};
