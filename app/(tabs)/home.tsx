import { StyleSheet, View, Pressable, ScrollView, Modal } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import theme from "../styles/theme";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { z } from "zod";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTransactions } from "../context/TransactionContext";
import Spinner from "react-native-loading-spinner-overlay";

const TransactionTypes = {
  INCOME: {
    label: "Income",
    color: theme.colors.highlight,
    icon: "trending-up",
  },
  EXPENSE: {
    label: "Expense",
    color: theme.colors.error,
    icon: "trending-down",
  },
  CREDIT_GIVEN: {
    label: "Credit Given",
    color: "#9C27B0",
    icon: "account-arrow-right",
  },
  CREDIT_RECEIVED: {
    label: "Credit Received",
    color: "#2196F3",
    icon: "account-arrow-left",
  },
} as const;

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "CREDIT_GIVEN", "CREDIT_RECEIVED"]),
  category: z.string(),
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

const incomeCategories = [
  { id: "salary", label: "Salary" },
  { id: "freelance", label: "Freelance" },
  { id: "investment", label: "Investment" },
  { id: "other", label: "Other" },
];

const expenseCategories = [
  { id: "food", label: "Food" },
  { id: "transport", label: "Transport" },
  { id: "utilities", label: "Utilities" },
  { id: "rent", label: "Rent" },
  { id: "shopping", label: "Shopping" },
  { id: "other", label: "Other" },
];

export default function Home() {
  const { addTransaction, isLoading } = useTransactions();
  const [selectedType, setSelectedType] = useState<
    keyof typeof TransactionTypes | null
  >(null);
  const [formData, setFormData] = useState({
    amount: "",
    category: "",
    description: "",
    paymentMode: "ONLINE" as "ONLINE" | "CASH",
    recurrence: undefined as
      | "DAILY"
      | "WEEKLY"
      | "MONTHLY"
      | "YEARLY"
      | undefined,
    relatedTo: "",
    isPaid: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTypeSelect = (type: keyof typeof TransactionTypes) => {
    Haptics.selectionAsync();
    setSelectedType(type);
    setFormData({
      amount: "",
      category: "",
      description: "",
      paymentMode: "ONLINE",
      recurrence: undefined,
      relatedTo: "",
      isPaid: true,
    });
    setErrors({});
  };

  const handleSave = async () => {
    try {
      const validData = transactionSchema.parse({
        ...formData,
        amount: Number(formData.amount),
        type: selectedType,
        date: new Date(),
      });

      await addTransaction(validData);
      setSelectedType(null);
      setFormData({
        amount: "",
        category: "",
        description: "",
        paymentMode: "ONLINE",
        recurrence: undefined,
        relatedTo: "",
        isPaid: true,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as string;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  const renderForm = () => {
    const isCreditTransaction =
      selectedType === "CREDIT_GIVEN" || selectedType === "CREDIT_RECEIVED";
    const categories =
      selectedType === "INCOME" ? incomeCategories : expenseCategories;

    return (
      <ScrollView style={styles.formContainer}>
        <TextInput
          label="Amount"
          value={formData.amount}
          onChangeText={(text) => setFormData({ ...formData, amount: text })}
          keyboardType="numeric"
          error={!!errors.amount}
          style={styles.input}
        />
        {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

        {!isCreditTransaction && (
          <>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    formData.category === category.id &&
                      styles.selectedCategoryChip,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, category: category.id })
                  }
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      formData.category === category.id &&
                        styles.selectedCategoryChipText,
                    ]}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.category && (
              <Text style={styles.errorText}>{errors.category}</Text>
            )}
          </>
        )}

        <TextInput
          label="Description"
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          error={!!errors.description}
          style={styles.input}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}

        <View style={styles.paymentModeContainer}>
          <Text style={styles.label}>Payment Mode</Text>
          <View style={styles.paymentModeButtons}>
            <Pressable
              style={[
                styles.paymentModeButton,
                formData.paymentMode === "ONLINE" && styles.selectedPaymentMode,
              ]}
              onPress={() =>
                setFormData({ ...formData, paymentMode: "ONLINE" })
              }
            >
              <MaterialCommunityIcons
                name="bank"
                size={24}
                color={formData.paymentMode === "ONLINE" ? "white" : "black"}
              />
              <Text
                style={[
                  styles.paymentModeText,
                  formData.paymentMode === "ONLINE" &&
                    styles.selectedPaymentModeText,
                ]}
              >
                Online
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.paymentModeButton,
                formData.paymentMode === "CASH" && styles.selectedPaymentMode,
              ]}
              onPress={() => setFormData({ ...formData, paymentMode: "CASH" })}
            >
              <MaterialCommunityIcons
                name="cash"
                size={24}
                color={formData.paymentMode === "CASH" ? "white" : "black"}
              />
              <Text
                style={[
                  styles.paymentModeText,
                  formData.paymentMode === "CASH" &&
                    styles.selectedPaymentModeText,
                ]}
              >
                Cash
              </Text>
            </Pressable>
          </View>
        </View>

        {!isCreditTransaction && (
          <View style={styles.recurrenceContainer}>
            <Text style={styles.label}>Recurrence (Optional)</Text>
            <View style={styles.recurrenceButtons}>
              {["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].map((rec) => (
                <Pressable
                  key={rec}
                  style={[
                    styles.recurrenceButton,
                    formData.recurrence === rec && styles.selectedRecurrence,
                  ]}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      recurrence: rec as
                        | "DAILY"
                        | "WEEKLY"
                        | "MONTHLY"
                        | "YEARLY",
                    })
                  }
                >
                  <Text
                    style={[
                      styles.recurrenceText,
                      formData.recurrence === rec &&
                        styles.selectedRecurrenceText,
                    ]}
                  >
                    {rec.charAt(0) + rec.slice(1).toLowerCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {isCreditTransaction && (
          <>
            <TextInput
              label="Related To"
              value={formData.relatedTo}
              onChangeText={(text) =>
                setFormData({ ...formData, relatedTo: text })
              }
              error={!!errors.relatedTo}
              style={styles.input}
            />
            {errors.relatedTo && (
              <Text style={styles.errorText}>{errors.relatedTo}</Text>
            )}

            <View style={styles.isPaidContainer}>
              <Text style={styles.label}>Payment Status</Text>
              <View style={styles.isPaidButtons}>
                <Pressable
                  style={[
                    styles.isPaidButton,
                    formData.isPaid && styles.selectedIsPaid,
                  ]}
                  onPress={() => setFormData({ ...formData, isPaid: true })}
                >
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={24}
                    color={formData.isPaid ? "white" : "black"}
                  />
                  <Text
                    style={[
                      styles.isPaidText,
                      formData.isPaid && styles.selectedIsPaidText,
                    ]}
                  >
                    Paid
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.isPaidButton,
                    !formData.isPaid && styles.selectedIsPaid,
                  ]}
                  onPress={() => setFormData({ ...formData, isPaid: false })}
                >
                  <MaterialCommunityIcons
                    name="clock"
                    size={24}
                    color={!formData.isPaid ? "white" : "black"}
                  />
                  <Text
                    style={[
                      styles.isPaidText,
                      !formData.isPaid && styles.selectedIsPaidText,
                    ]}
                  >
                    Pending
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <Button
            mode="outlined"
            style={styles.cancelButton}
            onPress={() => setSelectedType(null)}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
          >
            Save Transaction
          </Button>
        </View>
      </ScrollView>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <LinearGradient
          colors={["rgba(0,201,167,0.2)", "transparent"]}
          style={styles.headerGradient}
        >
          <Text variant="headlineMedium" style={styles.headerTitle}>
            TrackIt
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Your Financial Journey
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Overview Cards */}
      <View style={styles.overviewContainer}>
        {Object.entries(TransactionTypes).map(([type, data], index) => (
          <Animated.View
            key={type}
            entering={FadeInDown.delay(index * 100)}
            style={[styles.overviewCard, { borderColor: data.color }]}
          >
            <BlurView intensity={20} style={styles.cardBlur}>
              <Text
                variant="titleMedium"
                style={[styles.cardTitle, { color: data.color }]}
              >
                {data.label}
                <MaterialCommunityIcons
                  name={data.icon}
                  size={24}
                  color={data.color}
                />
              </Text>
              <Text variant="headlineSmall" style={styles.cardAmount}>
                ₹0.00
              </Text>
            </BlurView>
          </Animated.View>
        ))}
      </View>

      {/* Quick Add Section */}
      <View style={styles.quickAddSection}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Quick Add
        </Text>
        <View style={styles.typeButtons}>
          {Object.entries(TransactionTypes).map(([type, data]) => (
            <Pressable
              key={type}
              onPress={() =>
                handleTypeSelect(type as keyof typeof TransactionTypes)
              }
              style={[
                styles.typeButton,
                selectedType === type && { borderColor: data.color },
              ]}
            >
              <BlurView intensity={20} style={styles.typeButtonContent}>
                <Text style={[styles.typeButtonText, { color: data.color }]}>
                  {data.label}
                </Text>
              </BlurView>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Transaction Form Modal */}
      <Modal
        visible={selectedType !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedType(null)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={styles.formContainer}>
            <Text
              variant="titleLarge"
              style={[
                styles.formTitle,
                {
                  color: selectedType
                    ? TransactionTypes[selectedType].color
                    : theme.colors.primary,
                },
              ]}
            >
              New {selectedType ? TransactionTypes[selectedType].label : ""}
            </Text>

            {renderForm()}
          </BlurView>
        </View>
      </Modal>

      {/* Recent Transactions */}
      <View style={styles.recentTransactions}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Transactions
        </Text>
        <BlurView intensity={20} style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No recent transactions</Text>
        </BlurView>
      </View>
      <Spinner visible={isLoading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: 150,
    marginBottom: theme.spacing.large,
  },
  headerGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.large,
  },
  headerTitle: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: theme.colors.secondary,
    marginTop: theme.spacing.small,
  },
  overviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.medium,
    padding: theme.spacing.medium,
  },
  overviewCard: {
    width: "47%",
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardBlur: {
    padding: theme.spacing.medium,
  },
  cardTitle: {
    marginBottom: theme.spacing.small,
  },
  cardAmount: {
    color: theme.colors.primary,
  },
  quickAddSection: {
    padding: theme.spacing.medium,
  },
  sectionTitle: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.medium,
  },
  typeButton: {
    width: "47%",
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.glass,
    overflow: "hidden",
    marginBottom: theme.spacing.medium,
  },
  typeButtonContent: {
    padding: theme.spacing.medium,
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 16,
  },
  recentTransactions: {
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.xlarge,
  },
  emptyState: {
    padding: theme.spacing.large,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  emptyStateText: {
    color: theme.colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  formContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.large,
    borderTopRightRadius: theme.borderRadius.large,
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.large,
    maxHeight: "90%",
    color: "#fff",
  },
  formTitle: {
    marginBottom: theme.spacing.large,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    marginBottom: theme.spacing.medium,
    backgroundColor: "transparent",
    color: theme.colors.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -theme.spacing.small,
    marginBottom: theme.spacing.medium,
  },
  categoryContainer: {
    marginBottom: theme.spacing.medium,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.small,
  },
  label: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.small,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: theme.colors.glass,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  categoryButtonSelected: {
    borderColor: theme.colors.highlight,
    backgroundColor: "rgba(0,201,167,0.1)",
  },
  categoryButtonText: {
    color: theme.colors.secondary,
  },
  categoryButtonTextSelected: {
    color: theme.colors.highlight,
  },
  paymentModeContainer: {
    marginBottom: theme.spacing.medium,
  },
  paymentModeButtons: {
    flexDirection: "row",
    gap: theme.spacing.small,
  },
  paymentModeButton: {
    backgroundColor: theme.colors.glass,
    padding: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.glass,
  },
  selectedPaymentMode: {
    borderColor: theme.colors.highlight,
    backgroundColor: "rgba(0,201,167,0.1)",
  },
  paymentModeText: {
    color: theme.colors.secondary,
  },
  selectedPaymentModeText: {
    color: theme.colors.highlight,
  },
  recurrenceContainer: {
    marginBottom: theme.spacing.medium,
  },
  recurrenceButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.small,
  },
  recurrenceButton: {
    backgroundColor: theme.colors.glass,
    padding: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.glass,
  },
  selectedRecurrence: {
    borderColor: theme.colors.highlight,
    backgroundColor: "rgba(0,201,167,0.1)",
  },
  recurrenceText: {
    color: theme.colors.secondary,
  },
  selectedRecurrenceText: {
    color: theme.colors.highlight,
  },
  isPaidContainer: {
    marginBottom: theme.spacing.medium,
  },
  isPaidButtons: {
    flexDirection: "row",
    gap: theme.spacing.small,
  },
  isPaidButton: {
    backgroundColor: theme.colors.glass,
    padding: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    borderColor: theme.colors.glass,
  },
  selectedIsPaid: {
    borderColor: theme.colors.highlight,
    backgroundColor: "rgba(0,201,167,0.1)",
  },
  isPaidText: {
    color: theme.colors.secondary,
  },
  selectedIsPaidText: {
    color: theme.colors.highlight,
  },
  cancelButton: {
    width: "48%",
  },
  saveButton: {
    width: "48%",
  },
  categoryChip: {
    backgroundColor: theme.colors.glass,
    padding: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.glass,
  },
  selectedCategoryChip: {
    backgroundColor: "rgba(0,201,167,0.1)",
    borderColor: theme.colors.highlight,
  },
  categoryChipText: {
    color: theme.colors.secondary,
  },
  selectedCategoryChipText: {
    color: theme.colors.highlight,
  },
});
