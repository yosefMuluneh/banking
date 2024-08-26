"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createTransfer } from "@/lib/actions/dwolla.action";
import { createTransaction } from "@/lib/actions/transaction.action";
import { getBank, getBankByAccountId } from "@/lib/actions/user.actions";
import { decryptId, transferFormSchema } from "@/lib/utils";

import { BankDropdown } from "./BankDropdown";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import PaymentInputForm from "./PaymentInputForm";

const formSchema = transferFormSchema() 

const PaymentTransferForm = ({ accounts }: PaymentTransferFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      amount: "",
      senderBank: "",
      sharableId: "",
    },
  });

  const submit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const receiverAccountId = decryptId(data.sharableId);
      const receiverBank = await getBankByAccountId({
        accountId: receiverAccountId,
      });
      const senderBank = await getBank({ documentId: data.senderBank });

      const transferParams = {
        sourceFundingSourceUrl: senderBank.fundingSourceUrl,
        destinationFundingSourceUrl: receiverBank.fundingSourceUrl,
        amount: data.amount,
      };
      // create transfer
      const transfer = await createTransfer(transferParams);

      // create transfer transaction
      if (transfer) {
        const transaction = {
          name: data.name,
          amount: data.amount,
          senderId: senderBank.userId.$id,
          senderBankId: senderBank.$id,
          receiverId: receiverBank.userId.$id,
          receiverBankId: receiverBank.$id,
          email: data.email,
        };

        const newTransaction = await createTransaction(transaction);

        if (newTransaction) {
          form.reset();
          router.push("/");
        }
      }
    } catch (error) {
      console.error("Submitting create transfer request failed: ", error);
    }

    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col">
        
        <PaymentInputForm 
            accounts={accounts}
            control={form.control}
            value={form.setValue}
            label="Select Source Bank"
            descritption="Select the bank account you want to transfer funds from"
            otherStyles="pb-6 pt-5"
            name="senderBank"
         />

        <PaymentInputForm 
            descritption="Please provide any additional information or instructions
                    related to the transfer"
            label="Transfer Note (Optional)"
            otherStyles="pb-6 pt-5"
            name="name"
            control={form.control}
            placeholder="Write a short note here"
         />

        <div className="payment-transfer_form-details">
          <h2 className="text-18 font-semibold text-gray-900">
            Bank account details
          </h2>
          <p className="text-16 font-normal text-gray-600">
            Enter the bank account details of the recipient
          </p>
        </div>

        <PaymentInputForm 
            control={form.control}
            name='email'
            label="Recipient&apos;s Email Address"
            otherStyles="py-5"
            placeholder="ex: johndoe@gmail.com"
         />

        <PaymentInputForm 
            control={form.control}
            name='sharableId'
            label="Receiver&apos;s Plaid Sharable Id"
            otherStyles="pb-5 pt-6"
            placeholder="Enter the public account number"
         />

        <PaymentInputForm 
            name="amount" 
            label="Amount" 
            placeholder="ex: 5.00" 
            control={form.control} 
            otherStyles="py-5" 
         />

        <div className="payment-transfer_btn-box">
          <Button type="submit" className="payment-transfer_btn">
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> &nbsp; Sending...
              </>
            ) : (
              "Transfer Funds"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentTransferForm;