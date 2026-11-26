'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation'
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions'
import Image from 'next/image'
import { useToast } from '@/components/ui/toast'

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
  const router = useRouter()
  const { showToast, dismissAllOfType } = useToast()
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTokenLoading, setIsTokenLoading] = useState(true)

  // Link tokens are consumed during a successful public-token exchange.
  // Keep this component ready for the user's next bank connection.
  const refreshLinkToken = useCallback(async () => {
    setIsTokenLoading(true)

    try {
      const data = await createLinkToken(user)
      if (!data?.linkToken) throw new Error('Plaid did not return a Link token')

      setToken(data.linkToken)
      return true
    } catch (error) {
      console.error('Error creating Plaid Link token:', error)
      setToken('')
      showToast('Unable to prepare the bank connection. Please try again.', 'error')
      return false
    } finally {
      setIsTokenLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    void refreshLinkToken()
  }, [refreshLinkToken])

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, metadata) => {
      setIsLoading(true)
      showToast('Connecting your bank account...', 'loading')

      try {
        const exchangeResult = await exchangePublicToken({
          publicToken,
          user,
          selectedAccountId: metadata.accounts?.[0]?.id,
        })

        dismissAllOfType('loading')
        if (exchangeResult?.fundingSourceError) {
          showToast(
            'Your bank was connected, but Dwolla could not enable transfers for it. You can retry setup from Transfer Funds.',
            'error'
          )
        } else {
          showToast('Bank account connected successfully!', 'success')
        }

        // A successful exchange consumes the current Link token. Fetch a new
        // one before leaving so the persistent sidebar can connect more banks.
        const refreshed = await refreshLinkToken()
        if (!refreshed) {
          showToast(
            'Your bank was connected. Refresh the page before connecting another bank.',
            'error'
          )
        }

        router.push('/my-banks')
      } catch (error) {
        console.error('Error exchanging public token:', error)
        dismissAllOfType('loading')
        showToast('Failed to connect bank account. Please try again.', 'error')
        // The token may already have been consumed if the exchange succeeded
        // but saving the bank failed, so prepare a fresh token for retry.
        await refreshLinkToken()
      } finally {
        setIsLoading(false)
      }
    },
    [user, router, showToast, dismissAllOfType, refreshLinkToken]
  )

  const config: PlaidLinkOptions = {
    token,
    onSuccess,
  }

  const { open, ready } = usePlaidLink(config)
  const handleConnectClick = useCallback(() => {
    if (token) {
      open()
      return
    }

    void refreshLinkToken()
  }, [token, open, refreshLinkToken])

  // A failed token request should not leave the Connect button permanently
  // disabled. Let the user retry; only require Plaid readiness when a token exists.
  const isDisabled = isLoading || isTokenLoading || (Boolean(token) && !ready)

  const buttonContent = isLoading ? (
    <>
      <Loader2 size={20} className='animate-spin' />
      &nbsp; Connecting...
    </>
  ) : isTokenLoading ? (
    <>
      <Loader2 size={20} className='animate-spin' />
      &nbsp; Loading...
    </>
  ) : !token ? (
    'Retry Connection'
  ) : (
    'Connect Bank'
  )

  if (variant === 'primary') {
    return (
      <Button onClick={handleConnectClick} disabled={isDisabled} className='plaidlink-primary'>
        {buttonContent}
      </Button>
    )
  }

  if (variant === 'ghost') {
    return (
      <Button onClick={handleConnectClick} variant='ghost' disabled={isDisabled} className='plaidlink-ghost'>
        {isLoading || isTokenLoading ? (
          <Loader2 size={20} className='animate-spin' />
        ) : (
          <Image src='/icons/connect-bank.svg' alt='connect bank' width={24} height={24} />
        )}
        <p className='hidden text-[16px] font-semibold text-black-2 xl:block'>{token ? 'Connect Bank' : 'Retry Connection'}</p>
      </Button>
    )
  }

  return (
    <Button onClick={handleConnectClick} disabled={isDisabled} className='plaidlink-default'>
      {isLoading || isTokenLoading ? (
        <Loader2 size={20} className='animate-spin' />
      ) : (
        <Image src='/icons/connect-bank.svg' alt='connect bank' width={24} height={24} />
      )}
      <p className='text-[16px] font-semibold text-black-2'>{token ? 'Connect Bank' : 'Retry Connection'}</p>
    </Button>
  )
}

export default PlaidLink
