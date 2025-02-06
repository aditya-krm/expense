import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import theme from '../../styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RadioOption {
  value: string;
  label: string;
  icon?: string;
  color?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function RadioGroup({ options, value, onChange, error }: RadioGroupProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.radioGroup, error && styles.error]}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.radioOption,
              value === option.value && styles.selectedOption,
              option.color && { borderColor: option.color }
            ]}
            onPress={() => onChange(option.value)}
          >
            {option.icon && (
              <MaterialCommunityIcons
                name={option.icon as any}
                size={20}
                color={option.color || theme.colors.primary}
                style={styles.icon}
              />
            )}
            <Text
              style={[
                styles.label,
                value === option.value && styles.selectedLabel,
                option.color && { color: option.color }
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.glass,
    backgroundColor: theme.colors.background,
  },
  selectedOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.glass,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    color: theme.colors.secondary,
    fontSize: 14,
  },
  selectedLabel: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  error: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});
