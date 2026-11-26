import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Control, FieldPath } from "react-hook-form";
import { z } from "zod";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { BankDropdown } from "./BankDropdown";
import { transferFormSchema } from "@/lib/utils";

const transferSchema = transferFormSchema();

interface PaymentTransferInputProps {
  control: Control<z.infer<typeof transferSchema>>;
  label: string;
  descritption?: string;
  accounts?: Account[];
  otherStyles: string;
  name: FieldPath<z.infer<typeof transferSchema>>;
  placeholder?: string;
}

const PaymentInputForm = ({
  control,
  label,
  descritption,
  accounts = [],
  otherStyles,
  name,
  placeholder = "",
}: PaymentTransferInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="border-t border-gray-200">
          <div className={`payment-transfer_form-item ${otherStyles}`}>
            <div className="payment-transfer_form-content">
              <FormLabel className="text-14 font-medium text-gray-700">
                {label}
              </FormLabel>
              {(name === "name" || name === "senderBank") && descritption && (
                <FormDescription className="text-12 font-normal text-gray-600">
                  {descritption}
                </FormDescription>
              )}
            </div>
            <div className="flex w-full flex-col">
              <FormControl>
                {name === "senderBank" ? (
                  <BankDropdown
                    accounts={accounts}
                    value={String(field.value ?? "")}
                    onChange={field.onChange}
                    otherStyles={`${otherStyles} !w-full`}
                  />
                ) : name === "name" ? (
                  <Textarea
                    placeholder={placeholder}
                    className="input-class"
                    {...field}
                    value={field.value ?? ""}
                  />
                ) : (
                  <Input
                    placeholder={placeholder}
                    className="input-class"
                    {...field}
                    value={field.value ?? ""}
                  />
                )}
              </FormControl>
              <FormMessage className="text-12 text-red-500" />
            </div>
          </div>
        </FormItem>
      )}
    />
  );
};

export default PaymentInputForm;
