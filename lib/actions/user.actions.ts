'use server'

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequestProcessorEnum, Products, ProcessorTokenCreateRequest } from "plaid";
import { plaidClient } from "../plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.action";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const signUp = async ({password,...userData} : SignUpParams) => { 
  //destructure
  const { email, firstName, lastName } = userData;

  let newUserAccount;
    try{
      const { account, database } = await createAdminClient();

      newUserAccount = await account.create(
        ID.unique(), 
        email, 
        password, 
        `${firstName} ${lastName}`
      );

      if(!newUserAccount) throw new Error('Error creating user account');

      //create dwolla customer url
      const dwollaCustomerUrl = await createDwollaCustomer({
        ...userData,
        type : 'personal'
      });

      if(!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer');

      //dwolla customer id
      const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

      //create a document in the user collection
      const newUser = await database.createDocument(
        DATABASE_ID!,
        USER_COLLECTION_ID!,
        ID.unique(),
        {
          ...userData,
          userId: newUserAccount.$id,
          dwollaCustomerId,
          dwollaCustomerUrl
        }
      );

      const session = await account.createEmailPasswordSession(email, password);
    
      cookies().set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      return parseStringify(newUser);
    }catch(error){
        console.error('Error', error)
    }
}

export const signIn = async ({email, password}:signInProps) => {

  try{

    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    
      cookies().set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });
    const user = await getUserInfo({userId: session.userId});
    return parseStringify(user);
  }catch(error){
    console.error('Error', error)
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
      user:{
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ['auth'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[],
      }
    const response = await plaidClient.linkTokenCreate(toenParams);
    
    return parseStringify({linkToken : response.data.link_token});
  } catch (error) {
    console.error('Error', error);
  }
}

export const createBankAccount = async ({
  userId, 
  bankId, 
  accountId, 
  accessToken, 
  shareableId, 
  fundingSourceUrl
}:createBankAccountProps) => {
  try{
    const { database } = await createAdminClient();
    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        shareableId,
        fundingSourceUrl
      }
    );

    return parseStringify(bankAccount);
  }catch(error){
    console.error('Error', error);
  }
}

export const exchangePublicToken = async ({user, publicToken}:exchangePublicTokenProps) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken
    });

    //extract the access token and itemid
    const {access_token, item_id} = response.data;

    //get account information from plaid using the access token
    const accountsResponse = await plaidClient.accountsGet({
      access_token
    });

    //get the account details
    const accountData = accountsResponse.data.accounts[0];

    //create a processor token for Dwolla using access token and account id
    const request : ProcessorTokenCreateRequest = {
      account_id: accountData.account_id,
      processor: 'dwolla' as ProcessorTokenCreateRequestProcessorEnum,
      access_token
    }

    const processorTokenResponse = await plaidClient.processorTokenCreate(request);

    // access the processor token
    const processorToken = processorTokenResponse.data.processor_token;

    // create a funding source URL for the account using the Dwolla customer id, processor token and bank name
    const fundingSourceurl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name
    });

    if(!fundingSourceurl) throw Error;

    //create bank account using user id, item id, account id, access token, sharable id and funding source url
    const bankAccount = await createBankAccount({
      userId: user.$id,
      bankId: item_id,
      accountId: accountData.account_id,
      accessToken: access_token,
      shareableId: encryptId(accountData.account_id),
      fundingSourceUrl: fundingSourceurl
    });

    if(!bankAccount) throw new Error('Error creating bank account');
    revalidatePath('/')
    //return success message
    return parseStringify({
      publicTokenExchange: 'Bank account added successfully',
    });
  }catch (error) {
    console.error('Error', error);
  }
}

export const getBanks = async ({userId}:getBanksProps) => {
  try {
    const { database } = await createAdminClient();
    const banks = await database.listDocuments(
      DATABASE_ID!, 
      BANK_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );
    return parseStringify(banks.documents);
  } catch (error) {
    console.error('Error', error);
  }
}

export const getBank = async ({documentId}:getBankProps) => {
  try {
    const { database } = await createAdminClient();
    const bank = await database.listDocuments(
      DATABASE_ID!, 
      BANK_COLLECTION_ID!, 
      [Query.equal('$id', [documentId])]
    );
    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error('Error', error);
  }
}

export const getBankByAccountId = async ({accountId}:getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();
    const bank = await database.listDocuments(
      DATABASE_ID!, 
      BANK_COLLECTION_ID!, 
      [Query.equal('accountId', [accountId])]
    );
    
    if(bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.error('Error', error);
  }
}

