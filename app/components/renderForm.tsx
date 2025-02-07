import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { z } from 'zod';
import InputField from './ui/input-field';
import RadioGroup from './ui/radio-group';

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "CREDIT_GIVEN", "CREDIT_RECEIVED"]),
  category: z.string({ invalid_type_error: "Category is required" }),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be positive"),
  date: z.coerce.date().default(() => new Date()),
  description: z.string().min(2, "Description must be at least 2 characters"),
  paymentMode: z.enum(["ONLINE", "CASH"]),
  recurrence: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
  relatedTo: z.string().optional(),
  isPaid: z.boolean().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export type TransactionType = 'INCOME' | 'EXPENSE' | 'CREDIT_GIVEN' | 'CREDIT_RECEIVED';

interface TransactionFormProps {
  type: TransactionType;
  onSubmit: (data: TransactionFormData) => void;
  onCancel?: () => void;
}

const paymentMethods = [
  { value: 'CASH', label: 'Cash', icon: 'cash' },
  { value: 'ONLINE', label: 'Online', icon: 'bank' },
];

const categories = {
  INCOME: [
    { value: 'SALARY', label: 'Salary', icon: 'cash-multiple' },
    { value: 'BUSINESS', label: 'Business', icon: 'store' },
    { value: 'INVESTMENT', label: 'Investment', icon: 'chart-line' },
    { value: 'RENTAL', label: 'Rental', icon: 'home' },
    { value: 'FREELANCE', label: 'Freelance', icon: 'laptop' },
    { value: 'OTHER', label: 'Other', icon: 'dots-horizontal' },
  ],
  EXPENSE: [
    { value: 'FOOD', label: 'Food', icon: 'food' },
    { value: 'SHOPPING', label: 'Shopping', icon: 'shopping' },
    { value: 'TRANSPORT', label: 'Transport', icon: 'car' },
    { value: 'BILLS', label: 'Bills', icon: 'file-document' },
    { value: 'RENT', label: 'Rent', icon: 'home' },
    { value: 'HEALTHCARE', label: 'Healthcare', icon: 'medical-bag' },
    { value: 'EDUCATION', label: 'Education', icon: 'school' },
    { value: 'ENTERTAINMENT', label: 'Entertainment', icon: 'movie' },
    { value: 'GROCERIES', label: 'Groceries', icon: 'cart' },
    { value: 'UTILITIES', label: 'Utilities', icon: 'lightning-bolt' },
    { value: 'INSURANCE', label: 'Insurance', icon: 'shield' },
    { value: 'MAINTENANCE', label: 'Maintenance', icon: 'tools' },
    { value: 'CLOTHING', label: 'Clothing', icon: 'tshirt-crew' },
    { value: 'TRAVEL', label: 'Travel', icon: 'airplane' },
    { value: 'OTHER', label: 'Other', icon: 'dots-horizontal' },
  ],
  CREDIT_GIVEN: [
    { value: 'PERSONAL', label: 'Personal', icon: 'account' },
    { value: 'BUSINESS', label: 'Business', icon: 'store' },
    { value: 'FAMILY', label: 'Family', icon: 'account-group' },
    { value: 'FRIEND', label: 'Friend', icon: 'account-multiple' },
    { value: 'EMERGENCY', label: 'Emergency', icon: 'alert' },
  ],
  CREDIT_RECEIVED: [
    { value: 'PERSONAL', label: 'Personal', icon: 'account' },
    { value: 'BUSINESS', label: 'Business', icon: 'store' },
    { value: 'FAMILY', label: 'Family', icon: 'account-group' },
    { value: 'FRIEND', label: 'Friend', icon: 'account-multiple' },
    { value: 'EMERGENCY', label: 'Emergency', icon: 'alert' },
  ],
};

const recurrenceOptions = [
  { value: 'DAILY', label: 'Daily', icon: 'calendar-sync' },
  { value: 'WEEKLY', label: 'Weekly', icon: 'calendar-week' },
  { value: 'MONTHLY', label: 'Monthly', icon: 'calendar-month' },
  { value: 'YEARLY', label: 'Yearly', icon: 'calendar-month' },
];

const TransactionForm = ({ type, onSubmit, onCancel }: TransactionFormProps) => {
  const [formData, setFormData] = useState<Partial<TransactionFormData>>({
    type,
    amount: undefined,
    description: '',
    paymentMode: 'CASH',
    category: categories[type]?.[0]?.value || '',
    date: new Date(),
    isPaid: false,
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const handleChange = (field: keyof TransactionFormData, value: any) => {
    // If value is null and field is recurrence, remove it from formData
    if (value === null && field === 'recurrence') {
      const { recurrence, ...rest } = formData;
      setFormData(rest);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    if (errors[field] !== undefined) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    try {
      const result = transactionSchema.parse({
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount.toString()) : undefined,
      });
      setErrors({});
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string | undefined> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return { success: false, data: null };
    }
  };

  const handleSubmit = () => {
    const validation = validateForm();
    if (validation.success && validation.data) {
      onSubmit(validation.data);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Payment Method</Text>
      <RadioGroup
        options={paymentMethods}
        value={formData.paymentMode || 'CASH'}
        onChange={(value) => handleChange('paymentMode', value)}
      />

      <Text style={styles.label}>Category {" "}
        {errors.category && <Text style={styles.error}>{errors.category}</Text>}
      </Text>
      <RadioGroup
        options={categories[type]}
        value={formData.category || ''}
        onChange={(value) => handleChange('category', value)}
      />

      {(type === 'INCOME' || type === 'EXPENSE') && (
        <>
        <Text style={styles.label}>Recurrence</Text>
        <RadioGroup
          options={recurrenceOptions}
          value={formData.recurrence || null}
          onChange={(value) => handleChange('recurrence', value)}
        />
        </>
      )}

      {(type === 'CREDIT_GIVEN' || type === 'CREDIT_RECEIVED') && (
        <>
        <InputField
          icon="profile"
          placeholder="Related To"
          value={formData.relatedTo || ''}
          onChangeText={(text) => handleChange('relatedTo', text)}
          error={errors.relatedTo}
        />
        </>
      )}
      
      <InputField
        icon="cash"
        placeholder="Amount"
        keyboardType="phone-pad"
        value={formData.amount?.toString() || ''}
        onChangeText={(text) => handleChange('amount', text)}
        error={errors.amount}
      />

      <InputField
        icon="description"
        placeholder="Description"
        value={formData.description}
        onChangeText={(text) => handleChange('description', text)}
        error={errors.description}
      />

      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600',fontSize:16 }}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={{ color: '#000', textAlign: 'center', fontWeight: '600',fontSize:16 }}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TransactionForm;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  submitButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
});