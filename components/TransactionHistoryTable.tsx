"use client";

import React, { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getTransactionStatus } from "@/lib/utils";
import { Pagination } from "./Pagination";
import TransactionsTable from "./TransactionsTable";

const TransactionHistoryTable = ({
  transactions = [],
  page = 1,
}: TransactionHistoryTableProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(page);

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(transactions.map((transaction) => transaction.category).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b)),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          transaction.name,
          transaction.category,
          transaction.paymentChannel,
          getTransactionStatus(transaction),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch));

      const matchesCategory =
        categoryFilter === "all" || transaction.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        getTransactionStatus(transaction).toLowerCase() === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [transactions, search, categoryFilter, statusFilter]);

  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const safePage = totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const currentTransactions = filteredTransactions.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  return (
    <section className="flex min-w-0 w-full flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-gray-100 bg-white p-3 sm:p-4">
        <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-[minmax(180px,1fr)_minmax(150px,200px)_minmax(130px,160px)]">
          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-12 font-medium text-gray-600">Search transactions</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search name, category, channel..."
              className="h-10 min-w-0 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-12 font-medium text-gray-600">Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 min-w-0 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span className="text-12 font-medium text-gray-600">Transaction status</span>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              className="h-10 min-w-0 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All statuses</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-12 text-gray-500">
            Showing {filteredTransactions.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1}
            {"–"}
            {Math.min(safePage * rowsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
          </p>
          {(search || categoryFilter !== "all" || statusFilter !== "all") && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-12 font-semibold text-blue-700 hover:text-blue-900"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <TransactionsTable
        transactions={currentTransactions}
        isLoading={isPending}
      />

      {totalPages > 1 && (
        <div className="my-4 w-full">
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            isLoading={isPending}
          />
        </div>
      )}
    </section>
  );
};

export default TransactionHistoryTable;
