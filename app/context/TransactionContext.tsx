import React, { createContext, useContext, useEffect, useState } from "react";
import { Transaction, TransactionStatistics } from "../types/transaction";

const API_URL = `http://192.168.121.73:3000/api/transactions`;

interface TransactionContextType {
  transactions: Transaction[];
  statistics: TransactionStatistics | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<TransactionStatistics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const isCacheValid = () => {
    if (!lastFetched) return false;
    const now = new Date();
    return now.getTime() - lastFetched.getTime() < CACHE_DURATION;
  };

  const fetchTransactions = async (force = false) => {
    if (!force && isCacheValid()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTransactions(data);
      setLastFetched(new Date());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch transactions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/statistics`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStatistics(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch statistics"
      );
    }
  };

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => {
    console.log(transaction);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTransactions((prev) => [...prev, data]);
      await fetchStatistics();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add transaction"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (
    id: string,
    transaction: Partial<Transaction>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedTransaction = await response.json();
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? updatedTransaction : t))
      );
      await fetchStatistics();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update transaction"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      await fetchStatistics();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete transaction"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTransactions = () => fetchTransactions(true);

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
  }, []);

  const value = {
    transactions,
    statistics,
    isLoading,
    error,
    lastFetched,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
    fetchStatistics,
    refreshTransactions,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }
  return context;
}
