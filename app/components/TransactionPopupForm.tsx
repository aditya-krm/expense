import React, { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, StyleSheet, Animated, Text } from "react-native";
import { BlurView } from "expo-blur";
import TransactionForm from "./renderForm";
import { TransactionType } from "./renderForm";
import * as Haptics from "expo-haptics";

interface TransactionPopupFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  type: TransactionType;
  error?: string;
}

const TransactionPopupForm = ({ visible, onClose, onSubmit, type, error }: TransactionPopupFormProps) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(1000)).current;
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 1000,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      setShowError(false);
    }
  }, [visible]);

  useEffect(() => {
    if (error) {
      setShowError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const timer = setTimeout(() => {
        setShowError(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!visible) return null;

  const handleSubmit = (data: any) => {
    setShowError(false);
    onSubmit(data);
  };

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <Animated.View
        style={[
          styles.formContainer,
          {
            transform: [
              { translateY: translateY },
              { scale: scaleAnim }
            ],
          }
        ]}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View>
              <Text style={styles.title}>
                {type === 'INCOME' ? 'Add Income' :
                 type === 'EXPENSE' ? 'Add Expense' :
                 type === 'CREDIT_GIVEN' ? 'Add Credit Given' : 'Add Credit Taken'}
              </Text>
              <TransactionForm 
                type={type} 
                onSubmit={handleSubmit} 
                onCancel={onClose}
              />
              {showError && error && (
                <Animated.View 
                  style={styles.errorContainer}
                >
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              )}
            </View>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  formContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  blurContainer: {
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.2)',
  },
  errorText: {
    color: '#FF4444',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default TransactionPopupForm;
