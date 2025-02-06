import React, { createContext, useContext, useEffect, useState } from "react";
import { Transaction, TransactionStatistics } from "../types/transaction";
import useAuth from "./GlobalProvider";

const API_URL = `${process.env.EXPO_PUBLIC_API_URL}/transactions`;

interface TransactionFilters {
  type?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  statistics: TransactionStatistics | null;
  isLoading: boolean;
  error: string | null;
  filters: TransactionFilters;
  pagination: PaginationInfo;
  setFilters: (filters: Partial<TransactionFilters>) => void;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  fetchTransactions: (newFilters?: Partial<TransactionFilters>) => Promise<any>;
  fetchStatistics: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export function TransactionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<TransactionStatistics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const fetchTransactions = async (newFilters?: Partial<TransactionFilters>) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentFilters = { ...filters, ...newFilters };
      if (newFilters) {
        setFilters(currentFilters);
      }

      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "startDate" || key === "endDate") {
            queryParams.append(key, (value as Date).toISOString());
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (!responseData.success || !responseData.data) {
        throw new Error("Invalid data format received from API");
      }

      setTransactions(responseData.data.transactions);
      setPagination(responseData.data.pagination);
      setIsLoading(false);

      // After fetching transactions, also fetch statistics
      await fetchStatistics();

      return responseData;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
      throw err;
    }
  };

  const fetchStatistics = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (!responseData.success || !responseData.data) {
        throw new Error("Invalid statistics data format received from API");
      }

      setStatistics(responseData.data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setStatistics(null);
    }
  };

  const refreshTransactions = async () => {
    await fetchTransactions();
  };

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await refreshTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTransaction = async (
    id: string,
    transaction: Partial<Transaction>
  ) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await refreshTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await refreshTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

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
    filters,
    pagination,
    setFilters: (newFilters: Partial<TransactionFilters>) => {
      const updatedFilters = { ...filters, ...newFilters };
      setFilters(updatedFilters);
      fetchTransactions(updatedFilters);
    },
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

function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }
  return context;
}

export default useTransactions;