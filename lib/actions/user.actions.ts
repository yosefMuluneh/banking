'use server'

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite"
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export const signUp = async (data : SignUpParams) => { 
  //destructure
  const { email, password, firstname, lastname } = data;
    try{
      const { account } = await createAdminClient();

      const newUSerAccount = await account.create(
        ID.unique(), 
        email, 
        password, 
        `${firstname} ${lastname}`
      );
      const session = await account.createEmailPasswordSession(email, password);
    
      cookies().set("appwrite-session", session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: true,
      });

      return parseStringify(newUSerAccount);
    }catch(error){
        console.error('Error', error)
    }
  }

export const signIn = async ({email, password}:signInProps) => {

  try{

    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    console.log('the session ',session);
    return parseStringify(session);
  }catch(error){
    console.error('Error', error)
  }
}

// ... your initilization functions

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    console.log('the logged in user ',user);
    return parseStringify(user);
  } catch (error) {
    return null;
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