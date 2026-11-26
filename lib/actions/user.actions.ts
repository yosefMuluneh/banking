'use server'

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers";
import { encryptId, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequestProcessorEnum, Products, ProcessorTokenCreateRequest } from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.action";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

const getPlaidErrorDetails = (error: unknown) => {
  const plaidError = error as {
    message?: string;
    error_code?: string;
    error_message?: string;
    display_message?: string | null;
    response?: {
      data?: {
        error_code?: string;
        error_message?: string;
        display_message?: string | null;
      };
    };
  };
  const details = plaidError.response?.data ?? plaidError;
  const code = details.error_code;
  const message =
    details.display_message ||
    details.error_message ||
    plaidError.message ||
    "Plaid could not complete the bank-account request.";

  return {
    code,
    message: code ? `Plaid ${code}: ${message}` : message,
  };
};

export const signUp = async ({password,...userData} : SignUpParams) => {
  let admin: Awaited<ReturnType<typeof createAdminClient>> | undefined;
  let createdUserId: string | undefined;
  let createdProfileId: string | undefined;

  try {
    admin = await createAdminClient();

    const newUserAccount = await admin.account.create(
      ID.unique(),
      userData.email,
      password,
      `${userData.firstName} ${userData.lastName}`
    );
    createdUserId = newUserAccount.$id;

    // Registration is independent of banking providers. Provider accounts are
    // linked later, only where a supported provider is available.
    const profileId = ID.unique();
    const newUser = await admin.database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      profileId,
      {
        ...userData,
        userId: createdUserId,
      }
    );
    createdProfileId = newUser.$id;

    const session = await admin.account.createEmailPasswordSession(
      userData.email,
      password
    );

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return parseStringify(newUser);
  } catch (error) {
    console.error("Sign-up failed:", error);

    // Compensate for partial registration so an orphaned Auth account does
    // not prevent the user from retrying with the same email.
    if (admin && createdProfileId) {
      try {
        await admin.database.deleteDocument(
          DATABASE_ID!,
          USER_COLLECTION_ID!,
          createdProfileId
        );
      } catch (cleanupError) {
        console.error("Could not clean up the incomplete user profile:", cleanupError);
      }
    }

    if (admin && createdUserId) {
      try {
        await admin.user.delete(createdUserId);
      } catch (cleanupError) {
        console.error("Could not clean up the incomplete auth account:", cleanupError);
      }
    }

    throw new Error("Unable to create your account. Please try again or contact support if the problem continues.");
  }
}

export const signIn = async ({email, password}:signInProps) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    const user = await getUserInfo({userId: session.userId});
    return parseStringify(user);
  } catch(error) {
    console.error("Sign-in failed:", error);
    return null;
  }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();
    const user = await getUserInfo({userId: result.$id});
    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const getUserInfo = async ({userId}:getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();
    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error('Error', error);
  }
}

export async function logoutAccount () {
  try {
    const { account } = await createSessionClient();
    cookies().delete('appwrite-session');
    const deleteSession = await account.deleteSession('current');
    return parseStringify(deleteSession)
  } catch (error) {
    console.error('Error', error);
  }
}

export const createLinkToken = async (user: User) => {
  try {
    const toenParams = {
      user:{ client_user_id: user.$id },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ['auth', 'transactions'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[],
      account_selection: 'single',
    }
    const response = await plaidClient.linkTokenCreate(toenParams);
    return parseStringify({linkToken : response.data.link_token});
  } catch (error) {
    console.error('Error', error);
    throw new Error("Bank linking is currently unavailable.");
  }
}

export const createBankAccount = async ({
  userId, bankId, accountId, accessToken, shareableId, fundingSourceUrl
}:createBankAccountProps) => {
  try{
    const { database } = await createAdminClient();
    const bankAccount = await database.createDocument(
      DATABASE_ID!, BANK_COLLECTION_ID!, ID.unique(),
      { userId, bankId, accountId, accessToken, shareableId, fundingSourceUrl }
    );
    return parseStringify(bankAccount);
  }catch(error){
    console.error('Error', error);
    throw new Error("Unable to save the linked bank account.");
  }
}

export const exchangePublicToken = async ({
  user,
  publicToken,
  selectedAccountId,
}: exchangePublicTokenProps) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
    const {access_token, item_id} = response.data;

    const accountsResponse = await plaidClient.accountsGet({ access_token });
    const accounts = accountsResponse.data.accounts;
    const accountData = selectedAccountId
      ? accounts.find((account) => account.account_id === selectedAccountId)
      : accounts[0];

    if (!accountData) {
      throw new Error(
        selectedAccountId
          ? "The account selected in Plaid Link could not be retrieved. Please reconnect the bank and select an account."
          : "Plaid did not return an account for this bank connection."
      );
    }

    // Plaid bank linking remains independent of Dwolla. If a Dwolla
    // funding source cannot be created, still persist the Plaid connection
    // and report the transfer setup issue separately to the UI.
    let fundingSourceurl = "";
    let fundingSourceError: string | undefined;

    if (user.dwollaCustomerId) {
      try {
        const request: ProcessorTokenCreateRequest = {
          account_id: accountData.account_id,
          processor: 'dwolla' as ProcessorTokenCreateRequestProcessorEnum,
          access_token
        };
        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;

        fundingSourceurl = await addFundingSource({
          dwollaCustomerId: user.dwollaCustomerId,
          processorToken,
          bankName: accountData.name
        }) || "";
      } catch (error) {
        const details = getPlaidErrorDetails(error);
        // Provider errors may contain request configuration with access tokens.
        // Log only the sanitized provider code/message.
        console.error(
          "Plaid bank connected, but Dwolla funding source creation failed:",
          details.message
        );
        fundingSourceError = details.message;
      }
    }

    const bankAccount = await createBankAccount({
      userId: user.$id,
      bankId: item_id,
      accountId: accountData.account_id,
      accessToken: access_token,
      shareableId: encryptId(accountData.account_id),
      fundingSourceUrl: fundingSourceurl
    });

    if(!bankAccount) throw new Error('Error creating bank account');
    revalidatePath('/');
    return parseStringify({
      publicTokenExchange: 'Bank account added successfully',
      fundingSourceLinked: Boolean(fundingSourceurl),
      fundingSourceError,
    });
  } catch (error) {
    console.error('Error', error);
    throw error instanceof Error ? error : new Error("Unable to connect this bank account.");
  }
}

export const getBanks = async ({userId}:getBanksProps) => {
  try {
    const { database } = await createAdminClient();
    const banks = await database.listDocuments(
      DATABASE_ID!, BANK_COLLECTION_ID!, [Query.equal('userId', [userId])]
    );
    return parseStringify(banks.documents);
  } catch (error) {
    console.error('Error', error);
    return [];
  }
}

// Create a synthetic Dwolla personal customer in Sandbox and attach
// any existing Plaid-linked checking/savings accounts as funding sources.
// No real identity data is collected or persisted by this portfolio flow.
export const completeDwollaSandboxOnboarding = async () => {
  const user = await getLoggedInUser();

  if (!user) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (process.env.DWOLLA_ENV !== "sandbox") {
    throw new Error("Dwolla sandbox onboarding is available only when DWOLLA_ENV=sandbox.");
  }

  const { database } = await createAdminClient();
  let customerId = user.dwollaCustomerId;
  let customerUrl = user.dwollaCustomerUrl;

  if (!customerId) {
    const sandboxCustomer: NewDwollaCustomerParams = {
      firstName: "verified",
      lastName: "Customer",
      email: `sandbox-${user.$id}@example.com`,
      type: "personal",
      address1: "9876 Million Dollar St",
      city: "Des Moines",
      state: "IA",
      postalCode: "50265",
      dateOfBirth: "1980-01-01",
      ssn: "1234",
      ipAddress: "143.156.7.8",
    };

    customerUrl = await createDwollaCustomer(sandboxCustomer);
    const customerIdFromUrl = customerUrl.match(/\/customers\/([^/?#]+)/)?.[1];

    if (!customerIdFromUrl) {
      throw new Error("Dwolla created a customer but returned an invalid customer URL.");
    }

    customerId = customerIdFromUrl;

    await database.updateDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      user.$id,
      {
        dwollaCustomerId: customerId,
        dwollaCustomerUrl: customerUrl,
      }
    );
  }

  if (!customerId) {
    throw new Error("Dwolla customer setup did not return a customer ID.");
  }

  const banks = await getBanks({ userId: user.$id });
  const linkedBanks: string[] = [];
  const skippedBanks: string[] = [];
  const unsupportedBanks: Array<{ bankName: string; reason: string }> = [];
  const failedBanks: Array<{ bankName: string; reason: string }> = [];

  for (const bank of banks as Bank[]) {
    let bankName = bank.$id;

    if (bank.fundingSourceUrl) {
      skippedBanks.push(bank.$id);
      continue;
    }

    try {
      const accountsResponse = await plaidClient.accountsGet({
        access_token: bank.accessToken,
      });
      const account = accountsResponse.data.accounts.find(
        (item) => item.account_id === bank.accountId
      );

      if (!account) {
        throw new Error("The linked Plaid account could not be found.");
      }
      bankName = account.name;

      if (
        account.type !== "depository" ||
        !["checking", "savings"].includes(account.subtype ?? "")
      ) {
        throw new Error("Dwolla funding sources require a checking or savings account.");
      }

      const processorTokenResponse = await plaidClient.processorTokenCreate({
        access_token: bank.accessToken,
        account_id: bank.accountId,
        processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
      });

      const fundingSourceUrl = await addFundingSource({
        dwollaCustomerId: customerId,
        processorToken: processorTokenResponse.data.processor_token,
        bankName: account.name,
      });

      await database.updateDocument(
        DATABASE_ID!,
        BANK_COLLECTION_ID!,
        bank.$id,
        { fundingSourceUrl }
      );

      linkedBanks.push(bank.$id);
    } catch (error) {
      const details = getPlaidErrorDetails(error);
      // INVALID_ACCOUNT_ID means Plaid does not permit this account to be used
      // for money movement. The Plaid connection itself remains valid.
      if (details.code === "INVALID_ACCOUNT_ID") {
        unsupportedBanks.push({
          bankName,
          reason: details.message,
        });
        continue;
      }

      // Do not log the full SDK error object: request configuration can contain
      // sensitive access tokens. Keep diagnostics limited to provider messages.
      console.error(`Could not attach bank "${bankName}" to Dwolla:`, details.message);
      failedBanks.push({
        bankName,
        reason: details.message,
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/my-banks");
  revalidatePath("/payment-transfer");

  return parseStringify({
    customerId,
    customerCreated: !user.dwollaCustomerId,
    linkedCount: linkedBanks.length,
    alreadyLinkedCount: skippedBanks.length,
    unsupportedBanks,
    failedBanks,
    hasBanks: banks.length > 0,
  });
};

export const getBank = async ({documentId}:getBankProps) => {
  try {
    if (!documentId) return null;

    const { database } = await createAdminClient();
    const bank = await database.getDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      documentId
    );
    return parseStringify(bank);
  } catch (error) {
    console.error('Error getting bank document:', error);
    return null;
  }
}

export const getBankByAccountId = async ({accountId}:getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();
    const bank = await database.listDocuments(
      DATABASE_ID!, BANK_COLLECTION_ID!, [Query.equal('accountId', [accountId])]
    );
    if(bank.total !== 1) return null;
    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error('Error', error);
    return null;
  }
}
