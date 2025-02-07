import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { format } from 'date-fns';
import { Transaction, TransactionTypes } from '../types/transaction';
import theme from '../styles/theme';

interface TransactionCardProps {
  transaction: Transaction;
  onLongPress?: (transaction: Transaction, event: any) => void;
  isClickable?: boolean;
}

const TransactionCard = ({ 
  transaction, 
  onLongPress, 
  isClickable = true 
}: TransactionCardProps) => {
  const transactionType = transaction.type as keyof typeof TransactionTypes;
  const typeData = TransactionTypes[transactionType];

  const content = (
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
  );

  if (isClickable && onLongPress) {
    return (
      <TouchableOpacity
        key={transaction.id}
        onLongPress={(event) => onLongPress(transaction, event)}
        delayLongPress={500}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default TransactionCard

const styles = StyleSheet.create({
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
});
