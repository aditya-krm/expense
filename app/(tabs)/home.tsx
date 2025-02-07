import { StyleSheet, View, Pressable, ScrollView, RefreshControl } from "react-native";
import { Text, ActivityIndicator } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeIn } from "react-native-reanimated";
import { useCallback, useEffect, useState } from "react";
import * as Haptics from "expo-haptics";
import { z } from "zod";
import Spinner from "react-native-loading-spinner-overlay";

import theme from "../styles/theme";
import  useTransactions from "../context/TransactionContext";
import TransactionPopupForm from "../components/TransactionPopupForm";
import TransactionCard from '../components/TransactionCard';
import { TransactionTypes } from "../types/transaction";
import transactionSchema from "../types/transaction";
import OverviewCard from '../components/OverviewCard';

export default function Home() {
  const { addTransaction, transactions, isLoading, refreshTransactions, statistics } = useTransactions();
  const [selectedType, setSelectedType] = useState<
    keyof typeof TransactionTypes | null
  >(null);
  const [transactionError, setTransactionError] = useState<string | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshTransactions();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } finally {
      setRefreshing(false);
    }
  }, [refreshTransactions]);

  const handleTypeSelect = (type: keyof typeof TransactionTypes) => {
    Haptics.selectionAsync();
    setSelectedType(type);
    setTransactionError(undefined);
  };

  const handleSave = async (formData: any) => {
    try {
      const validData = transactionSchema.parse({
        ...formData,
        date: new Date(),
      });

      await addTransaction(validData);
      setSelectedType(null);
      setTransactionError(undefined);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessage = error.errors.map(err => err.message).join('\n');
        setTransactionError(errorMessage);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        setTransactionError('An unexpected error occurred. Please try again.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Spinner visible={isLoading} />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
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
          <OverviewCard
            type={TransactionTypes.INCOME}
            amount={statistics?.totalIncome ?? 0}
            delay={0}
          />
          <OverviewCard
            type={TransactionTypes.EXPENSE}
            amount={statistics?.totalExpense ?? 0}
            delay={100}
          />
          <OverviewCard
            type={TransactionTypes.CREDIT_GIVEN}
            amount={statistics?.totalCreditGiven ?? 0}
            delay={200}
          />
          <OverviewCard
            type={TransactionTypes.CREDIT_RECEIVED}
            amount={statistics?.totalCreditReceived ?? 0}
            delay={300}
          />
        </View>

        {/* Quick Add Section */}
        <View style={styles.quickAddSection}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Add Transaction
          </Text>
          <View style={styles.typeButtons}>
            {Object.entries(TransactionTypes).map(([type, data]) => (
              <Pressable
                key={type}
                onPress={() =>
                  handleTypeSelect(type as keyof typeof TransactionTypes)
                }
                style={({ pressed }) => [
                  styles.typeButton,
                  selectedType === type && styles.selectedTypeButton,
                  pressed && styles.pressedTypeButton
                ]}
              >
                <LinearGradient
                  colors={[`${data.color}20`, 'transparent']}
                  style={styles.typeButtonGradient}
                >
                  <Text style={[styles.typeButtonText, { color: data.color }]}>
                    {data.label}
                  </Text>
                  <Text style={[styles.typeButtonSubtext, { color: `${data.color}99` }]}>
                    {type === 'INCOME' ? 'Money In' :
                     type === 'EXPENSE' ? 'Money Out' :
                     type === 'CREDIT_GIVEN' ? 'someone taken from you' : 'someone gave you'}
                  </Text>
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View style={styles.recentTransactionsContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Recent Transactions
          </Text>
          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : transactionError ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{transactionError}</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          ) : (
            <ScrollView style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  isClickable={false}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>

      <TransactionPopupForm
        visible={selectedType !== null}
        onClose={() => {
          setSelectedType(null);
          setTransactionError(undefined);
        }}
        onSubmit={handleSave}
        type={selectedType as "INCOME" | "EXPENSE" | "CREDIT_GIVEN" | "CREDIT_RECEIVED"}
        error={transactionError}
      />
    </View>
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
  quickAddSection: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    color: theme.colors.primary,
    marginBottom: theme.spacing.medium,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
  },
  selectedTypeButton: {
    transform: [{ scale: 1.02 }],
    elevation: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pressedTypeButton: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  typeButtonGradient: {
    padding: 12,
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.glass,
    borderRadius: 12,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeButtonSubtext: {
    fontSize: 12,
    opacity: 0.8,
  },
  recentTransactionsContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  transactionsList: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: theme.colors.surfaceVariant,
    textAlign: "center",
  },
  errorText: {
    color: theme.colors.error,
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    textAlign: 'center',
  },
});
