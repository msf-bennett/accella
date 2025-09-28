import React from 'react';
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { Surface, Text, Button } from 'react-native-paper';
import { COLORS } from '../../styles/colors';
import { TEXT_STYLES } from '../../styles/typography';
import { SPACING } from '../../styles/layout';

const ConfirmDialog = ({ 
  visible, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  confirmColor = COLORS.error,
  icon = null 
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <Surface style={styles.modal} elevation={8}>
              {icon && (
                <View style={styles.iconContainer}>
                  {icon}
                </View>
              )}
              
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>
              
              <View style={styles.actions}>
                <Button 
                  mode="outlined" 
                  onPress={onCancel}
                  style={styles.cancelButton}
                  labelStyle={styles.cancelButtonText}
                >
                  {cancelLabel}
                </Button>
                
                <Button 
                  mode="contained" 
                  onPress={onConfirm}
                  style={[styles.confirmButton, { backgroundColor: confirmColor }]}
                  labelStyle={styles.confirmButtonText}
                >
                  {confirmLabel}
                </Button>
              </View>
            </Surface>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  modal: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.surface || '#ffffff',
    borderRadius: 16,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  title: {
    ...TEXT_STYLES.h3,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'center',
    color: COLORS.text || '#000000',
  },
  message: {
    ...TEXT_STYLES.body,
    marginBottom: SPACING.xl,
    textAlign: 'center',
    color: COLORS.textSecondary || '#666666',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    borderColor: COLORS.outline || '#e0e0e0',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: COLORS.textSecondary || '#666666',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    borderRadius: 8,
    elevation: 0,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default ConfirmDialog;