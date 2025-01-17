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
  title: z.string().min(2, "Title must be at least 2 characters"),
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE", "CREDIT_GIVEN", "CREDIT_RECEIVED"]),
  categoryId: z.string(),
  description: z.string().optional(),
  relatedTo: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  recurrence: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
});

const categories = [
  { id: "food", label: "Food" },
  { id: "transport", label: "Transport" },
  { id: "utilities", label: "Utilities" },
  { id: "rent", label: "Rent" },
  { id: "shopping", label: "Shopping" },
  { id: "other", label: "Other" },
];

export default function Home() {
  const [selectedType, setSelectedType] = useState<
    keyof typeof TransactionTypes | null
  >(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    categoryId: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTypeSelect = (type: keyof typeof TransactionTypes) => {
    Haptics.selectionAsync();
    setSelectedType(type);
    setFormData({
      title: "",
      amount: "",
      categoryId: "",
      description: "",
    });
    setErrors({});
  };

  const handleSave = () => {
    try {
      const validData = transactionSchema.parse({
        ...formData,
        amount: Number(formData.amount),
        type: selectedType,
      });
      console.log("Valid transaction:", validData);
      // TODO: Send to backend
      setSelectedType(null);
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

            <TextInput
              mode="outlined"
              label="Title"
              value={formData.title}
              onChangeText={(text) => {
                setFormData({ ...formData, title: text });
                setErrors({ ...errors, title: "" });
              }}
              error={!!errors.title}
              style={styles.input}
              theme={{
                colors: {
                  primary: theme.colors.highlight,
                  error: theme.colors.error,
                },
              }}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}

            <TextInput
              mode="outlined"
              label="Amount"
              value={formData.amount}
              onChangeText={(text) => {
                setFormData({
                  ...formData,
                  amount: text.replace(/[^0-9.]/g, ""),
                });
                setErrors({ ...errors, amount: "" });
              }}
              error={!!errors.amount}
              style={styles.input}
              keyboardType="decimal-pad"
              theme={{
                colors: {
                  primary: theme.colors.highlight,
                  error: theme.colors.error,
                },
              }}
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount}</Text>
            )}

            <View style={styles.categoryContainer}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryButtons}>
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    onPress={() => {
                      setFormData({ ...formData, categoryId: category.id });
                      setErrors({ ...errors, categoryId: "" });
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.categoryButton,
                      formData.categoryId === category.id &&
                        styles.categoryButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        formData.categoryId === category.id &&
                          styles.categoryButtonTextSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.categoryId && (
                <Text style={styles.errorText}>{errors.categoryId}</Text>
              )}
            </View>

            <TextInput
              mode="outlined"
              label="Description (Optional)"
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              style={styles.input}
              multiline
              theme={{
                colors: {
                  primary: theme.colors.highlight,
                },
              }}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={() => setSelectedType(null)}
                style={styles.button}
                textColor={theme.colors.secondary}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                style={[
                  styles.button,
                  {
                    backgroundColor: selectedType
                      ? TransactionTypes[selectedType].color
                      : theme.colors.highlight,
                  },
                ]}
              >
                Save
              </Button>
            </View>
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
    padding: theme.spacing.large,
    maxHeight: "90%",
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.medium,
    marginTop: theme.spacing.large,
  },
  button: {
    flex: 1,
  },
});
