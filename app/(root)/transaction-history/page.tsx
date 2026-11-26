import HeaderBox from '@/components/HeaderBox'
import TransactionHistoryTable from '@/components/TransactionHistoryTable'
import { getAccount, getAccounts } from '@/lib/actions/bank.action'
import { getLoggedInUser } from '@/lib/actions/user.actions'
import { formatAmount } from '@/lib/utils'
import React from 'react'

const TransactionHistory = async ({ searchParams: { id, page } }: SearchParamProps) => {
  const currentPage = Number(page as string) || 1
  const loggedIn = await getLoggedInUser()
  const accounts = await getAccounts({ userId: loggedIn.$id })

  if (!accounts) return

  const accountsData = accounts.data
  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId

  const account = appwriteItemId
    ? await getAccount({ appwriteItemId })
    : null

  return (
    <div className='transactions'>
      <div className='transactions-header'>
        <HeaderBox
          title='Transaction History'
          subtext='View and filter your transaction history'
        />
      </div>

      {account ? (
        <div className='space-y-6'>
          <div className='transactions-account'>
            <div className='flex flex-col gap-2'>
              <h2 className='text-18 font-bold text-white'>{account.data.name}</h2>
              <p className='text-14 text-blue-25'>{account.data.officialName}</p>
              <p className='text-14 font-semibold tracking-[1.1px] text-white'>
                ●●●● ●●●● ●●●● {account.data.mask}
              </p>
            </div>
            <div className='transactions-account-balance'>
              <p className='text-14'>Current balance</p>
              <p className='text-24 text-center font-bold'>
                {formatAmount(account.data.currentBalance)}
              </p>
            </div>
          </div>

          <TransactionHistoryTable
            transactions={account.transactions ?? []}
            page={currentPage}
          />
        </div>
      ) : (
        <div className='rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-500'>
          Connect a bank account to view your transaction history.
        </div>
      )}
    </div>
  )
}

export default TransactionHistory
