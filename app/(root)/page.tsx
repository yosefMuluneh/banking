import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar'
import TotalBalanceBox from '@/components/TotalBalanceBox'
import React from 'react'

const Home = () => {
  const loggedIn = { firstName: 'John', lastName: 'Doe', email: 'john@doe.mymail' }
  return (
    <section className='home'>
      <div className='home-content'>
        <header className='home-header'>
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext = "We're happy to see you again! Access and Manage your account and transactions with ease."
          
          />
          <TotalBalanceBox
          accounts={[]}
          totalBanks = {1}
          totalCurrentBalance={1234.57} />
        </header>
      </div>
      <RightSidebar  
        user = {loggedIn}
        transactions = {[]}
        banks = {[
          { currentBalance: 10000},
          { currentBalance: 20000}
        ]}
      />
    </section>
  )
}

export default Home