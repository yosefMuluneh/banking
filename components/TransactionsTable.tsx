import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  cn,
  formatAmount,
  formatDateTime,
  getTransactionStatus,
  removeSpecialCharacters,
} from "@/lib/utils";
import { transactionCategoryStyles } from "@/constants";

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const {
    borderColor,
    backgroundColor,
    textColor,
    chipBackgroundColor,
  } =
    transactionCategoryStyles[
      category as keyof typeof transactionCategoryStyles
    ] || transactionCategoryStyles.default;

  return (
    <div className={cn("category-badge", borderColor, chipBackgroundColor)}>
      <div className={cn("size-2 shrink-0 rounded-full", backgroundColor)} />
      <p className={cn("text-[12px] font-medium", textColor)}>{category}</p>
    </div>
  );
};

const TransactionsTable = ({
  transactions,
  isLoading = false,
}: TransactionTableProps) => {
  return (
    <div className="min-w-0">
      <Table className="min-w-[680px]">
        <TableHeader className="bg-[#f9fafb]">
          <TableRow>
            <TableHead className="px-3">Transaction</TableHead>
            <TableHead className="px-3">Amount</TableHead>
            <TableHead className="px-3">Status</TableHead>
            <TableHead className="px-3">Date</TableHead>
            <TableHead className="px-3 max-md:hidden">Channel</TableHead>
            <TableHead className="px-3 max-md:hidden">Category</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <TableRow key={`loading-${index}`} className="h-[68px]">
                <TableCell className="px-3">
                  <div className="h-4 w-36 max-w-full animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell className="px-3">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell className="px-3">
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
                </TableCell>
                <TableCell className="px-3">
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell className="px-3 max-md:hidden">
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                </TableCell>
                <TableCell className="px-3 max-md:hidden">
                  <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
                </TableCell>
              </TableRow>
            ))
          ) : transactions.length > 0 ? (
            transactions.map((transaction: Transaction) => {
              const status = getTransactionStatus(transaction);
              const amount = formatAmount(transaction.amount);
              const isDebit = transaction.type === "debit";
              const isCredit = transaction.type === "credit";

              return (
                <TableRow
                  key={transaction.id}
                  className={`${isDebit || amount[0] === "-" ? "bg-[#FFFBFA]" : "bg-[#F6FEF9]"} !border-b-DEFAULT`}
                >
                  <TableCell className="max-w-[250px] px-3">
                    <h1 className="truncate text-14 font-semibold text-[#344054]">
                      {removeSpecialCharacters(transaction.name)}
                    </h1>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "whitespace-nowrap px-3 font-semibold",
                      isDebit || amount[0] === "-"
                        ? "text-[#f04438]"
                        : "text-[#039855]"
                    )}
                  >
                    {isDebit ? `-${amount}` : isCredit ? amount : amount}
                  </TableCell>
                  <TableCell className="px-3">
                    <CategoryBadge category={status} />
                  </TableCell>
                  <TableCell className="min-w-32 whitespace-nowrap px-3">
                    {formatDateTime(new Date(transaction.date)).dateTime}
                  </TableCell>
                  <TableCell className="min-w-24 px-3 capitalize max-md:hidden">
                    {transaction.paymentChannel}
                  </TableCell>
                  <TableCell className="px-3 max-md:hidden">
                    <CategoryBadge category={transaction.category} />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-sm text-gray-500">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsTable;
