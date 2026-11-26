"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, FlaskConical } from "lucide-react";

import { completeDwollaSandboxOnboarding } from "@/lib/actions/user.actions";
import { useToast } from "@/components/ui/toast";
import { Button } from "./ui/button";

type OnboardingResult = {
  customerCreated: boolean;
  linkedCount: number;
  alreadyLinkedCount: number;
  failedBanks: Array<{ bankName: string; reason: string }>;
  hasBanks: boolean;
};

const DwollaOnboarding = ({
  bankCount,
  hasDwollaCustomer,
}: {
  bankCount: number;
  hasDwollaCustomer: boolean;
}) => {
  const router = useRouter();
  const { showToast, dismissAllOfType } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OnboardingResult | null>(null);

  const handleSetup = async () => {
    setIsLoading(true);
    showToast("Setting up your Dwolla sandbox profile...", "loading");

    try {
      const response = (await completeDwollaSandboxOnboarding()) as OnboardingResult;
      setResult(response);
      dismissAllOfType("loading");

      if (response.failedBanks.length > 0) {
        showToast(
          "Your sandbox customer is ready, but some bank accounts still need attention.",
          "error"
        );
      } else {
        showToast("Dwolla sandbox setup completed successfully.", "success");
      }

      router.refresh();
    } catch (error) {
      console.error("Dwolla sandbox onboarding failed:", error);
      dismissAllOfType("loading");
      showToast(
        error instanceof Error
          ? error.message
          : "Could not complete Dwolla sandbox setup. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-blue-50 p-3">
          <FlaskConical className="h-6 w-6 text-blue-700" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900">
            Enable sandbox transfers
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            {hasDwollaCustomer
              ? "Finish attaching your existing Plaid bank accounts as Dwolla sandbox funding sources."
              : "Create a simulated Dwolla customer and connect your existing Plaid banks as sandbox funding sources."}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">
          Sandbox testing only — do not enter real personal information.
        </p>
        <p className="mt-1 text-sm leading-5 text-amber-800">
          This flow sends synthetic test identity details to Dwolla Sandbox.
          It does not collect or save a real SSN, date of birth, or home address.
          It cannot be used to onboard a real customer or move real money.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Synthetic test profile used
        </h3>
        <div className="grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
          <p><span className="text-gray-500">Name:</span> Sandbox Tester</p>
          <p><span className="text-gray-500">Address:</span> 9876 Million Dollar St</p>
          <p><span className="text-gray-500">City / State:</span> Des Moines, IA</p>
          <p><span className="text-gray-500">ZIP:</span> 50265</p>
          <p><span className="text-gray-500">Date of birth:</span> 1980-01-01</p>
          <p><span className="text-gray-500">SSN:</span> synthetic last-four test value</p>
          <p className="sm:col-span-2">
            <span className="text-gray-500">Email:</span> unique example.com sandbox address
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-gray-600">
        <ShieldCheck className="h-4 w-4 shrink-0 text-green-700" />
        <span>
          {bankCount > 0
            ? `${bankCount} existing Plaid bank connection(s) will be checked and attached where supported.`
            : "You can connect a Plaid bank after creating the sandbox customer."}
        </span>
      </div>

      <Button
        type="button"
        onClick={handleSetup}
        disabled={isLoading}
        className="mt-6 w-full sm:w-auto"
      >
        {isLoading ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Setting up sandbox...
          </>
        ) : (
          {hasDwollaCustomer
            ? "Complete sandbox bank setup"
            : "Create sandbox customer and link banks"}
        )}
      </Button>

      {result && (
        <div className="mt-5 rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">Setup result</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            <li>New Dwolla customer: {result.customerCreated ? "Created" : "Already existed"}</li>
            <li>Bank funding sources created: {result.linkedCount}</li>
            <li>Already linked: {result.alreadyLinkedCount}</li>
          </ul>
          {!result.hasBanks && (
            <p className="mt-3 text-sm text-gray-600">
              Your sandbox customer is ready. Connect a US sandbox bank from My Banks;
              the app will create its Dwolla funding source automatically.
            </p>
          )}
          {result.failedBanks.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-red-700">
                Some bank accounts could not be attached:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                {result.failedBanks.map((bank, index) => (
                  <li key={index}>{bank.bankName}: {bank.reason}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-gray-500">
                You can retry this setup after resolving the listed account issue.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DwollaOnboarding;
