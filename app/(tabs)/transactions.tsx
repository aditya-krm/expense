import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform, RefreshControl } from "react-native";
import React, { useCallback, useState } from "react";
import useTransactions from "../context/TransactionContext";
import { Transaction } from "../types/transaction";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format } from "date-fns";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import theme from "../styles/theme";
import Spinner from "react-native-loading-spinner-overlay";
import TransactionMenu from "../components/TransactionMenu";

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

const Transactions = () => {
  const {
    transactions,
    isLoading,
    error,
    filters,
    pagination,
    setFilters,
    fetchTransactions,
    refreshTransactions,
    updateTransaction,
    deleteTransaction,
  } = useTransactions();

  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | undefined>();

  // Get unique categories from transactions
  const categories = [...new Set(transactions.map((t) => t.category))];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } finally {
      setRefreshing(false);
    }
  }, [refreshTransactions]);

  const handleDateChange = (event: any, selectedDate?: Date, isStart = true) => {
    const currentDate = selectedDate;
    if (isStart) {
      setShowStartDate(Platform.OS === 'ios');
      if (currentDate) {
        setFilters({ startDate: currentDate });
      }
    } else {
      setShowEndDate(Platform.OS === 'ios');
      if (currentDate) {
        setFilters({ endDate: currentDate });
      }
    }
  };

  const showDatePicker = (isStart: boolean) => {
    if (isStart) {
      setShowStartDate(true);
      setShowEndDate(false);
    } else {
      setShowEndDate(true);
      setShowStartDate(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    setFilters({ search: text, page: 1 });
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setFilters({ type: value || undefined, page: 1 });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setFilters({ category: value || undefined, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters({ page: newPage });
    }
  };

  const handleLongPress = (transaction: Transaction, event: any) => {
    // Get the tap position from the event
    const { pageX, pageY } = event.nativeEvent;
    setSelectedTransaction(transaction);
    setMenuPosition({ x: pageX, y: pageY });
    setShowMenu(true);
  };

  const handleCloseMenu = () => {
    setShowMenu(false);
    setMenuPosition(undefined);
  };

  const handleEdit = async () => {
    // Close menu first
    setShowMenu(false);
    // Add your edit logic here
    // You might want to navigate to an edit screen or show a modal
  };

  const handleDelete = async () => {
    if (!selectedTransaction) return;
    
    setShowMenu(false);
    try {
      await deleteTransaction(selectedTransaction.id);
      // Transaction list will be automatically updated through context
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const renderTransaction = (transaction: Transaction) => {
    const transactionType = transaction.type as keyof typeof TransactionTypes;
    const typeData = TransactionTypes[transactionType];

    return (
      <TouchableOpacity
        key={transaction.id}
        onLongPress={(event) => handleLongPress(transaction, event)}
        delayLongPress={500}
      >
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={styles.transactionCard}
        >
          <View style={[styles.transactionIcon, { backgroundColor: typeData.color }]}>
            <MaterialCommunityIcons
              name={typeData.icon}
              size={24}
              color="white"
            />
          </View>
          <View style={styles.transactionDetails}>
            <Text style={styles.description}>{transaction.description}</Text>
            <Text style={styles.transactionMeta}>
              {format(new Date(transaction.date), "MMM dd, yyyy")} • {transaction.paymentMode}
              {transaction.relatedTo && ` • ${transaction.relatedTo}`}
            </Text>
          </View>
          <Text
            style={[
              styles.amount,
              { color: typeData.color },
            ]}
          >
            {transaction.type === "EXPENSE" ? "-" : "+"}₹{Math.abs(transaction.amount).toFixed(2)}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
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
            <Text style={styles.headerTitle}>All Transactions</Text>
            <Text style={styles.headerSubtitle}>
              View and filter your transaction history
            </Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.filterContainer}>
          <BlurView intensity={20} style={styles.filterContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              value={searchText}
              onChangeText={handleSearch}
              placeholderTextColor={theme.colors.secondary}
            />

            <View style={styles.filterRow}>
              <Picker
                selectedValue={selectedType}
                style={styles.picker}
                onValueChange={handleTypeChange}
              >
                <Picker.Item label="All Types" value="" />
                <Picker.Item label="Income" value="INCOME" />
                <Picker.Item label="Expense" value="EXPENSE" />
                <Picker.Item label="Credit Given" value="CREDIT_GIVEN" />
                <Picker.Item label="Credit Received" value="CREDIT_RECEIVED" />
              </Picker>

              <Picker
                selectedValue={selectedCategory}
                style={styles.picker}
                onValueChange={handleCategoryChange}
              >
                <Picker.Item label="All Categories" value="" />
                {categories.map((category) => (
                  <Picker.Item key={category} label={category} value={category} />
                ))}
              </Picker>
            </View>

            <View style={styles.dateContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => showDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {filters.startDate
                    ? format(filters.startDate, "MMM dd, yyyy")
                    : "Start Date"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => showDatePicker(false)}
              >
                <Text style={styles.dateButtonText}>
                  {filters.endDate
                    ? format(filters.endDate, "MMM dd, yyyy")
                    : "End Date"}
                </Text>
              </TouchableOpacity>
            </View>

            {Platform.OS === 'ios' && (
              <>
                {showStartDate && (
                  <DateTimePicker
                    testID="startDatePicker"
                    value={filters.startDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => handleDateChange(event, date, true)}
                  />
                )}
                {showEndDate && (
                  <DateTimePicker
                    testID="endDatePicker"
                    value={filters.endDate || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => handleDateChange(event, date, false)}
                  />
                )}
              </>
            )}
          </BlurView>
        </View>

        <View style={styles.transactionListContainer}>
          {isLoading ? (
            <View style={styles.centerContent}>
              <Spinner visible={true} />
            </View>
          ) : error ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : transactions.length === 0 ? (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          ) : (
            <ScrollView style={styles.transactionList}>
              {transactions.map(renderTransaction)}
            </ScrollView>
          )}
        </View>

        <View style={styles.pagination}>
          <TouchableOpacity
            style={[
              styles.pageButton,
              pagination.page === 1 && styles.disabledButton,
            ]}
            onPress={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>

          <Text style={styles.pageText}>
            Page {pagination.page} of {pagination.totalPages}
          </Text>

          <TouchableOpacity
            style={[
              styles.pageButton,
              pagination.page === pagination.totalPages && styles.disabledButton,
            ]}
            onPress={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TransactionMenu
        visible={showMenu}
        onClose={handleCloseMenu}
        onEdit={handleEdit}
        onDelete={handleDelete}
        position={menuPosition}
      />
    </View>
  );
};

export default Transactions;

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
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.secondary,
    marginTop: theme.spacing.small,
  },
  filterContainer: {
    margin: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.glass,
  },
  filterContent: {
    padding: theme.spacing.medium,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.glass,
    borderRadius: theme.borderRadius.small,
    paddingHorizontal: 12,
    color: theme.colors.primary,
  },
  filterRow: {
    flexDirection: "row",
    marginVertical:8,
    gap: theme.spacing.small,
  },
  picker: {
    flex: 1,
    height: 60,
    backgroundColor: "transparent",
    borderWidth: 1,
    color: theme.colors.primary,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: theme.spacing.small,
  },
  dateButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.glass,
    borderRadius: theme.borderRadius.small,
    justifyContent: "center",
    alignItems: "center",
  },
  dateButtonText: {
    color: theme.colors.primary,
  },
  transactionListContainer: {
    flex: 1,
    padding: theme.spacing.medium,
  },
  transactionList: {
    flex: 1,
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceVariant,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
    borderWidth: 1,
    borderColor: theme.colors.glass,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.medium,
  },
  transactionDetails: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  transactionMeta: {
    fontSize: 12,
    color: theme.colors.secondary,
    marginTop: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.large,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
  },
  emptyText: {
    color: theme.colors.secondary,
    textAlign: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.medium,
    gap: theme.spacing.medium,
  },
  pageButton: {
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 1,
    borderColor: theme.colors.glass,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
});
