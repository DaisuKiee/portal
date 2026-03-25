import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import Preloader from './src/components/Preloader';
import NotificationPermissionScreen from './src/screens/NotificationPermissionScreen';
import { toastConfig } from './src/config/toastConfig';

export default function App() {
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showPermission, setShowPermission] = React.useState(false);

  React.useEffect(() => {
    const errorHandler = (error, isFatal) => {
      console.error('App Error:', error);
      setError(error.message);
    };
    
    // This will catch errors
    if (global.ErrorUtils) {
      global.ErrorUtils.setGlobalHandler(errorHandler);
    }

    // Check if we need to show permission screen
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      // Show preloader for at least 2.5 seconds
      const minLoadTime = new Promise(resolve => setTimeout(resolve, 2500));
      
      const permissionAsked = await AsyncStorage.getItem('notificationPermissionAsked');
      
      await minLoadTime;
      
      setIsLoading(false);
      
      // If permission hasn't been asked yet, show permission screen
      if (!permissionAsked) {
        setShowPermission(true);
      }
    } catch (error) {
      console.error('Error checking permission status:', error);
      setIsLoading(false);
    }
  };

  const handlePermissionComplete = () => {
    setShowPermission(false);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>App Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>Check the console for details</Text>
      </View>
    );
  }

  // Show preloader
  if (isLoading) {
    return <Preloader />;
  }

  // Show notification permission screen
  if (showPermission) {
    return <NotificationPermissionScreen onComplete={handlePermissionComplete} />;
  }

  // Show main app
  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AppNavigator />
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
