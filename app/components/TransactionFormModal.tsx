import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TransactionForm from './renderForm';
import { TransactionType } from './renderForm';
import theme from '../styles/theme';
import { TransactionFormData } from '../types/transaction';

interface TransactionFormModalProps {
  isVisible: boolean;
  onClose: () => void;
  type: TransactionType;
  onSubmit: (data: TransactionFormData) => void;
}

export default function TransactionFormModal({
  isVisible,
  onClose,
  type,
  onSubmit
}: TransactionFormModalProps) {
  const handleSubmit = (data: TransactionFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <BlurView intensity={20} style={styles.backdrop}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.formContainer}>
              <TransactionForm
                type={type}
                onSubmit={handleSubmit}
                onCancel={onClose}
              />
            </ScrollView>
          </View>
        </BlurView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    marginTop: 60,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.glass,
  },
  closeButton: {
    padding: 8,
  },
  formContainer: {
    flex: 1,
    padding: theme.spacing.medium,
  },
});
