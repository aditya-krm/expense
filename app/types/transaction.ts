import { z } from "zod";

export const transactionSchema = z.object({
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

export interface TransactionStatistics {
  totalIncome: number;
  totalExpense: number;
  totalCreditGiven: number;
  totalCreditReceived: number;
  netBalance: number;
}
