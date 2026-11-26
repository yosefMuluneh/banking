"use client";

import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select";
import { formatAmount } from "@/lib/utils";

export const BankDropdown = ({
  accounts = [],
  value = "",
  onChange,
  otherStyles,
}: BankDropdownProps) => {
  const selectedAccount =
    accounts.find((account) => account.appwriteItemId === value) ?? accounts[0];

  return (
    <Select
      value={selectedAccount?.appwriteItemId ?? ""}
      onValueChange={onChange}
      disabled={accounts.length === 0}
    >
      <SelectTrigger
        className={`flex w-full gap-3 bg-white md:w-[300px] ${otherStyles ?? ""}`}
      >
        <Image
          src="/icons/credit-card.svg"
          width={20}
          height={20}
          alt="account"
        />
        <p className="line-clamp-1 w-full text-left">
          {selectedAccount?.name ?? "No bank account available"}
        </p>
      </SelectTrigger>
      <SelectContent
        className={`w-full bg-white md:w-[300px] ${otherStyles ?? ""}`}
        align="end"
      >
        <SelectGroup>
          <SelectLabel className="py-2 font-normal text-gray-500">
            Select a source bank
          </SelectLabel>
          {accounts.map((account) => (
            <SelectItem
              key={account.appwriteItemId}
              value={account.appwriteItemId}
              className="cursor-pointer border-t"
            >
              <div className="flex flex-col">
                <p className="text-16 font-medium">{account.name}</p>
                <p className="text-14 font-medium text-blue-600">
                  {formatAmount(account.currentBalance)}
                </p>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
