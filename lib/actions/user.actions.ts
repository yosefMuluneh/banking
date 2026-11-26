'use server'

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers";
import { encryptId, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequestProcessorEnum, Products, ProcessorTokenCreateRequest } from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource } from "./dwolla.action";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

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
      products: ['auth'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[],
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

export const exchangePublicToken = async ({user, publicToken}:exchangePublicTokenProps) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
    const {access_token, item_id} = response.data;

    const accountsResponse = await plaidClient.accountsGet({ access_token });
    const accountData = accountsResponse.data.accounts[0];

    const request : ProcessorTokenCreateRequest = {
      account_id: accountData.account_id,
      processor: 'dwolla' as ProcessorTokenCreateRequestProcessorEnum,
      access_token
    };
    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    if (!user.dwollaCustomerId) {
      throw new Error("This bank-linking integration is not enabled for your account's country.");
    }

    const fundingSourceurl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name
    });
    if(!fundingSourceurl) throw new Error("Unable to create a bank funding source.");

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
    return parseStringify({ publicTokenExchange: 'Bank account added successfully' });
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

export const getBank = async ({documentId}:getBankProps) => {
  try {
    const { database } = await createAdminClient();
    const bank = await database.listDocuments(
      DATABASE_ID!, BANK_COLLECTION_ID!, [Query.equal('$id', [documentId])]
    );
    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error('Error', error);
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
