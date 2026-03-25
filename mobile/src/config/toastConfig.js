import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../styles/theme';

export const toastConfig = {
  success: ({ text1, text2, props, hide }) => (
    <View style={[styles.toastContainer, styles.successToast]}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeButton}>
        <Ionicons name="close" size={20} color={COLORS.darkGray} />
      </TouchableOpacity>
    </View>
  ),

  error: ({ text1, text2, props, hide }) => (
    <View style={[styles.toastContainer, styles.errorToast]}>
      <View style={styles.iconContainer}>
        <Ionicons name="close-circle" size={28} color={COLORS.error} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeButton}>
        <Ionicons name="close" size={20} color={COLORS.darkGray} />
      </TouchableOpacity>
    </View>
  ),

  info: ({ text1, text2, props, hide }) => (
    <View style={[styles.toastContainer, styles.infoToast]}>
      <View style={styles.iconContainer}>
        <Ionicons name="information-circle" size={28} color={COLORS.info} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeButton}>
        <Ionicons name="close" size={20} color={COLORS.darkGray} />
      </TouchableOpacity>
    </View>
  ),

  warning: ({ text1, text2, props, hide }) => (
    <View style={[styles.toastContainer, styles.warningToast]}>
      <View style={styles.iconContainer}>
        <Ionicons name="warning" size={28} color={COLORS.warning} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={hide} style={styles.closeButton}>
        <Ionicons name="close" size={20} color={COLORS.darkGray} />
      </TouchableOpacity>
    </View>
  ),

  confirm: ({ text1, text2, props, hide }) => (
    <View style={[styles.toastContainer, styles.confirmToast]}>
      <View style={styles.iconContainer}>
        <Ionicons name="help-circle" size={28} color={COLORS.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.toastTitle}>{text1}</Text>
        {text2 ? <Text style={styles.toastMessage}>{text2}</Text> : null}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.confirmButton, styles.cancelButton]}
            onPress={() => {
              hide();
              props?.onCancel?.();
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.confirmButton, styles.okButton]}
            onPress={() => {
              hide();
              props?.onConfirm?.();
            }}
          >
            <Text style={styles.okButtonText}>{props?.confirmText || 'Confirm'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.borderRadiusLg,
    padding: 16,
    marginHorizontal: '5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
  },
  successToast: {
    borderLeftColor: COLORS.success,
  },
  errorToast: {
    borderLeftColor: COLORS.error,
  },
  infoToast: {
    borderLeftColor: COLORS.info,
  },
  warningToast: {
    borderLeftColor: COLORS.warning,
  },
  confirmToast: {
    borderLeftColor: COLORS.primary,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 15,
    color: COLORS.secondary,
    ...FONTS.bold,
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 13,
    color: COLORS.darkGray,
    ...FONTS.regular,
    lineHeight: 18,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 10,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: SIZES.borderRadiusSm,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
  },
  okButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 14,
    color: COLORS.darkGray,
    ...FONTS.semiBold,
  },
  okButtonText: {
    fontSize: 14,
    color: COLORS.white,
    ...FONTS.bold,
  },
});
