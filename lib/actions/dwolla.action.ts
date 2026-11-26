"use server";

import { Client } from "dwolla-v2";

const getEnvironment = (): "production" | "sandbox" => {
  const environment = process.env.DWOLLA_ENV as string;

  switch (environment) {
    case "sandbox":
      return "sandbox";
    case "production":
      return "production";
    default:
      throw new Error(
        "Dwolla environment should either be set to `sandbox` or `production`"
      );
  }
};

const dwollaClient = new Client({
  environment: getEnvironment(),
  key: process.env.DWOLLA_KEY as string,
  secret: process.env.DWOLLA_SECRET as string,
});

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
  options: CreateFundingSourceOptions
) => {
  try {
    return await dwollaClient
      .post(`customers/${options.customerId}/funding-sources`, {
        name: options.fundingSourceName,
        plaidToken: options.plaidToken,
      })
      .then((res) => res.headers.get("location"));
  } catch (err) {
    console.error("Creating a Funding Source Failed: ", err);
  }
};

export const createOnDemandAuthorization = async () => {
  try {
    const onDemandAuthorization = await dwollaClient.post(
      "on-demand-authorizations"
    );
    const authLink = onDemandAuthorization.body._links;
    return authLink;
  } catch (err) {
    console.error("Creating an On Demand Authorization Failed: ", err);
  }
};

export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams
) => {
  try {
    return await dwollaClient
      .post("customers", newCustomer)
      .then((res) => res.headers.get("location"));
  } catch (err) {
    console.error("Creating a Dwolla Customer Failed: ", err);
  }
};

export const createTransfer = async ({
  sourceFundingSourceUrl,
  destinationFundingSourceUrl,
  amount,
}: TransferParams) => {
  if (!sourceFundingSourceUrl || !destinationFundingSourceUrl) {
    throw new Error(
      "Both bank accounts must have Dwolla funding sources. Complete Dwolla setup and reconnect any bank that was linked before setup."
    );
  }

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Enter a valid transfer amount greater than zero.");
  }

  try {
    const requestBody = {
      _links: {
        source: { href: sourceFundingSourceUrl },
        destination: { href: destinationFundingSourceUrl },
      },
      amount: {
        currency: "USD",
        value: numericAmount.toFixed(2),
      },
    };

    const response = await dwollaClient.post("transfers", requestBody);
    const transferUrl = response.headers.get("location");

    if (!transferUrl) {
      throw new Error("Dwolla did not return a transfer confirmation.");
    }

    return transferUrl;
  } catch (error) {
    console.error("Dwolla transfer request failed:", error);

    const dwollaError = error as {
      message?: string;
      body?: {
        message?: string;
        _embedded?: { errors?: Array<{ message?: string }> };
      };
    };
    const providerMessage =
      dwollaError.body?._embedded?.errors?.[0]?.message ??
      dwollaError.body?.message ??
      dwollaError.message;

    throw new Error(
      providerMessage
        ? `Dwolla could not process this transfer: ${providerMessage}`
        : "Dwolla could not process this transfer. Check the bank funding sources and sandbox account configuration."
    );
  }
};

export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams) => {
  try {
    // create dwolla auth link
    const dwollaAuthLinks = await createOnDemandAuthorization();

    // add funding source to the dwolla customer & get the funding source url
    const fundingSourceOptions = {
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      plaidToken: processorToken,
      _links: dwollaAuthLinks,
    };
    return await createFundingSource(fundingSourceOptions);
  } catch (err) {
    console.error("Transfer fund failed: ", err);
  }
};