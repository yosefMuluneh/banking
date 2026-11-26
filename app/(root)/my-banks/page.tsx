import BankCard from '@/components/BankCard'
import HeaderBox from '@/components/HeaderBox'
import PlaidLink from '@/components/PlaidLink'
import { getAccounts } from '@/lib/actions/bank.action'
import { getLoggedInUser } from '@/lib/actions/user.actions'
import React from 'react'

const MyBanks = async () => {
  const loggedIn = await getLoggedInUser()

  if (!loggedIn) return null

  const accounts = await getAccounts({ userId: loggedIn.$id })
  const bankAccounts = accounts?.data ?? []

  return (
    <section className='my-banks'>
      <div className='w-full'>
        <HeaderBox
          title='My Bank Accounts'
          subtext='Manage your connected bank accounts and view their balances.'
        />

        <div className='mt-8 space-y-6'>
          <div className='flex flex-wrap items-center justify-between gap-4'>
            <h2 className='header-2'>Your Bank Accounts</h2>
            <PlaidLink user={loggedIn} variant='primary' />
          </div>

          {bankAccounts.length > 0 ? (
            <div className='flex flex-wrap gap-6'>
              {bankAccounts.map((account: Account) => (
                <BankCard
                  key={account.id}
                  account={account}
                  userName={loggedIn.firstName}
                  showBalance={true}
                />
              ))}
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 px-6 py-14 text-center'>
              <div className='text-5xl' aria-hidden='true'>🏦</div>
              <div className='space-y-2'>
                <h3 className='text-lg font-semibold'>No bank accounts connected</h3>
                <p className='max-w-md text-sm text-gray-500'>
                  Connect a US bank account through Plaid to view its balance and transactions.
                </p>
              </div>
              <PlaidLink user={loggedIn} variant='primary' />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default MyBanks
