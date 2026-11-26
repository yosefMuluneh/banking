import HeaderBox from '@/components/HeaderBox'
import RecentTransactions from '@/components/RecentTransactions'
import RightSidebar from '@/components/RightSidebar'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import { getAccount, getAccounts } from '@/lib/actions/bank.action'
import { getLoggedInUser } from '@/lib/actions/user.actions'
import React from 'react'
import { redirect } from 'next/navigation'

const Home = async ({ searchParams : { id, page} } : SearchParamProps) => {
  const currentPage = Number(page as string) || 1
  const loggedIn = await getLoggedInUser()
  if (!loggedIn) redirect('/sign-in')

  const accounts = await getAccounts({ userId: loggedIn.$id })

  if(!accounts) return;


  const accountsData = accounts?.data

  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId

  // New users can have a valid Horizon profile without a linked bank account.
  // Only fetch Plaid account details when a bank document ID exists.
  const account = appwriteItemId
    ? await getAccount({ appwriteItemId })
    : null
  
  return (
    <section className='home'>
      <div className='home-content'>
        {accountsData.length === 0 && (
          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900'>
            Your Horizon account is ready. Bank connections and transfers will be enabled when a banking provider is available for your country.
          </div>
        )}
        <header className='home-header'>
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext = "Access and Manage your account and transactions with ease."
          
          />
          
          <TotalBalanceBox
          accounts={accountsData}
          totalBanks = {accounts?.totalBanks}
          totalCurrentBalance={accounts?.totalCurrentBalance} />
        </header>

        <RecentTransactions 
          accounts = {accountsData}
          transactions = {account?.transactions ?? []}
          appwriteItemId={appwriteItemId}
          page={currentPage}

         />

      </div>
      <RightSidebar  
        user = {loggedIn}
        transactions = {account?.transactions}
        banks = {accountsData?.slice(0, 2)}
      />
    </section>
  )

}

export default Home