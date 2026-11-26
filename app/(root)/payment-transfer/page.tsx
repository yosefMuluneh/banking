import HeaderBox from "@/components/HeaderBox";
import PaymentTransferForm from "@/components/PaymentTransferForm";
import DwollaOnboarding from "@/components/DwollaOnboarding";
import { getAccounts } from "@/lib/actions/bank.action";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import Link from "next/link";
import { redirect } from "next/navigation";

const PaymentTransfer = async () => {
  const loggedIn = await getLoggedInUser();

  if (!loggedIn) redirect("/sign-in");

  const accounts = await getAccounts({ userId: loggedIn.$id });
  const accountsData = accounts?.data ?? [];

  if (!loggedIn.dwollaCustomerId) {
    return (
      <section className="payment-transfer">
        <HeaderBox
          title="Set Up Transfers"
          subtext="Complete the Dwolla sandbox setup before initiating a transfer."
        />
        <div className="size-full pt-5">
          <DwollaOnboarding bankCount={accountsData.length} />
        </div>
      </section>
    );
  }

  if (accountsData.length === 0) {
    return (
      <section className="payment-transfer">
        <HeaderBox
          title="Payment Transfer"
          subtext="Connect a bank account before initiating a transfer."
        />
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            No bank accounts connected
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connect a US sandbox checking or savings account to create a Dwolla funding source.
          </p>
          <Link
            href="/my-banks"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Go to My Banks
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="payment-transfer">
      <HeaderBox
        title="Payment Transfer"
        subtext="Provide the recipient details and amount for your sandbox transfer."
      />
      <section className="size-full pt-5">
        <PaymentTransferForm accounts={accountsData} />
      </section>
    </section>
  );
};

export default PaymentTransfer;
