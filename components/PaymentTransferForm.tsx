"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createTransfer } from "@/lib/actions/dwolla.action";
import { createTransaction } from "@/lib/actions/transaction.action";
import {
  getBank,
  getBankByAccountId,
  getLoggedInUser,
} from "@/lib/actions/user.actions";
import { decryptId, transferFormSchema } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

import { Button } from "./ui/button";
import { Form } from "./ui/form";
import PaymentInputForm from "./PaymentInputForm";

const formSchema = transferFormSchema();

const PaymentTransferForm = ({ accounts }: PaymentTransferFormProps) => {
  const router = useRouter();
  const { showToast, dismissAllOfType } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      amount: "",
      senderBank: accounts[0]?.appwriteItemId ?? "",
      sharableId: "",
    },
  });

  const submit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    showToast("Processing your transfer...", "loading");

    try {
      const currentUser = await getLoggedInUser();
      if (!currentUser) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      let receiverAccountId: string;
      try {
        receiverAccountId = decryptId(data.sharableId.trim());
      } catch {
        throw new Error("The recipient shareable ID is invalid.");
      }

      if (!receiverAccountId) {
        throw new Error("Enter a valid recipient shareable ID.");
      }

      const [senderBank, receiverBank] = await Promise.all([
        getBank({ documentId: data.senderBank }),
        getBankByAccountId({ accountId: receiverAccountId }),
      ]);

      if (!senderBank) {
        throw new Error("The selected source bank could not be found. Please select it again.");
      }
      if (senderBank.userId !== currentUser.$id) {
        throw new Error("You can only transfer from a bank account linked to your own profile.");
      }
      if (!receiverBank) {
        throw new Error("No recipient bank account was found for that shareable ID.");
      }
      if (senderBank.$id === receiverBank.$id) {
        throw new Error("Choose a different recipient bank account.");
      }
      if (!senderBank.fundingSourceUrl || !receiverBank.fundingSourceUrl) {
        throw new Error(
          "Both the sender and recipient must complete Dwolla sandbox setup and link a supported US checking or savings account."
        );
      }

      const transferUrl = await createTransfer({
        sourceFundingSourceUrl: senderBank.fundingSourceUrl,
        destinationFundingSourceUrl: receiverBank.fundingSourceUrl,
        amount: Number(data.amount).toFixed(2),
      });

      if (!transferUrl) {
        throw new Error("Dwolla did not confirm the transfer. Please try again.");
      }

      // Bank documents store userId as a plain Appwrite user-document ID,
      // not as an expanded object with a nested $id.
      await createTransaction({
        name: data.name?.trim() || "Bank transfer",
        amount: Number(data.amount).toFixed(2),
        senderId: senderBank.userId,
        senderBankId: senderBank.$id,
        receiverId: receiverBank.userId,
        receiverBankId: receiverBank.$id,
        email: data.email.trim().toLowerCase(),
      });

      form.reset({
        name: "",
        email: "",
        amount: "",
        senderBank: accounts[0]?.appwriteItemId ?? "",
        sharableId: "",
      });
      dismissAllOfType("loading");
      showToast(
        "Transfer submitted successfully. Its final settlement status may update after Dwolla processes it.",
        "success"
      );
      router.push("/");
    } catch (error) {
      console.error("Submitting transfer request failed:", error);
      dismissAllOfType("loading");
      showToast(
        error instanceof Error
          ? error.message
          : "Something went wrong while processing the transfer. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="flex flex-col">
        <PaymentInputForm
          accounts={accounts}
          control={form.control}
          label="Select Source Bank"
          descritption="Select the bank account you want to transfer funds from"
          otherStyles="pb-6 pt-5"
          name="senderBank"
        />

        <PaymentInputForm
          descritption="Please provide any additional information or instructions related to the transfer"
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
          name="email"
          label="Recipient's Email Address"
          otherStyles="py-5"
          placeholder="ex: johndoe@gmail.com"
        />

        <PaymentInputForm
          control={form.control}
          name="sharableId"
          label="Recipient's Plaid Shareable ID"
          otherStyles="pb-5 pt-6"
          placeholder="Enter the recipient's shareable ID"
        />

        <PaymentInputForm
          name="amount"
          label="Amount"
          placeholder="ex: 5.00"
          control={form.control}
          otherStyles="py-5"
        />

        <div className="payment-transfer_btn-box">
          <Button
            type="submit"
            className="payment-transfer_btn"
            disabled={isLoading || accounts.length === 0}
          >
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
