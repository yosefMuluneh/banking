import BankCard from '@/components/BankCard'
import HeaderBox from '@/components/HeaderBox'
import { getAccounts } from '@/lib/actions/bank.action'
import { getLoggedInUser } from '@/lib/actions/user.actions'
import React from 'react'

const MyBanks = async () => {
  const loggedIn = await getLoggedInUser()
  const accounts = await getAccounts({ userId: loggedIn.$id })

  console.log('first bank info-----------=====------',accounts?.data[0])

  return (
    <section className='fle'>
      <div className='my-banks'>
        <HeaderBox title='My Bank Accounts' subtext='Manage your banking activities efffortlesly!'/>
      <div className='space-y-4'>
        <h2 className='header-2'>
          Your Cards
        </h2>
        <div className='flex flex-wrap gap-6'>
          {
            accounts && accounts.data.map((acc : Account)=>(
              <BankCard 
                key={acc.id}
                account={acc}
                userName={loggedIn?.firstName}
                showBalance={true}
               />
            ))
          }
        </div>
      </div>

      </div>
    </section>
  )
}

export default MyBanks