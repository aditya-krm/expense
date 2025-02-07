import { z } from "zod";
import theme from "../styles/theme";

const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "CREDIT_GIVEN", "CREDIT_RECEIVED"]),
  category: z.string(),
  amount: z.number().positive("Amount must be positive"),
  date: z.coerce.date().default(() => new Date()),
  description: z.string().min(2, "Description must be at least 2 characters"),
  paymentMode: z.enum(["ONLINE", "CASH"]),
  recurrence: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
  relatedTo: z.string().optional(),
  isPaid: z.boolean().optional(),
});

export type Transaction = z.infer<typeof transactionSchema> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TransactionFormData = Omit<z.infer<typeof transactionSchema>, 'id' | 'createdAt' | 'updatedAt'>;

export interface TransactionStatistics {
  totalIncome: number;
  totalExpense: number;
  totalCreditGiven: number;
  totalCreditReceived: number;
  netBalance: number;
}

export const TransactionTypes = {
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

export default transactionSchema;