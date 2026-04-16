import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { COLORS, FONTS, SIZES } from '../styles/theme';

const AdminNotificationsScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
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
      // TODO: Implement broadcast notification API
      Toast.show({
        type: 'success',
        text1: 'Notification Sent',
        text2: 'Broadcast sent to all users',
        position: 'top',
        topOffset: 60,
      });
      
      setTitle('');
      setMessage('');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Send Failed',
        text2: 'Could not send notification',
        position: 'top',
        topOffset: 60,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.secondary} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Send Notification</Text>
          <Text style={styles.headerSubtitle}>Broadcast to All Users</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              <Ionicons name="megaphone" size={14} color={COLORS.secondary} /> Title
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Notification title"
              placeholderTextColor={COLORS.mediumGray}
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              <Ionicons name="document-text" size={14} color={COLORS.secondary} /> Message
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notification message"
              placeholderTextColor={COLORS.mediumGray}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSendNotification}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons name="send" size={20} color={COLORS.white} />
                <Text style={styles.sendButtonText}>Send to All Users</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.ultraLightGray,
  },
  header: {
    backgroundColor: COLORS.secondary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    color: COLORS.white,
    ...FONTS.bold,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.white + 'CC',
    ...FONTS.regular,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.lg,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: COLORS.secondary,
    ...FONTS.semiBold,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.ultraLightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.secondary,
    ...FONTS.regular,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 50,
    gap: 8,
    marginTop: 10,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 15,
    color: COLORS.white,
    ...FONTS.bold,
  },
});

export default AdminNotificationsScreen;
