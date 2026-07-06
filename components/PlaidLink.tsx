import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation'
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions'
import Image from 'next/image'
import { useToast } from '@/components/ui/toast'

const PlaidLink = ({ user, variant}:PlaidLinkProps) => {

    const router = useRouter()
    const { showToast, dismissAllOfType } = useToast()
    const [token, setToken] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(()=>{
        const fetchToken = async () => {
            try {
                const data = await createLinkToken(user)
                setToken(data?.linkToken || '')
            } catch (error) {
                console.error('Error creating link token:', error)
                showToast('Failed to initialize bank connection. Please try again.', 'error')
            }
        }
        fetchToken()
    },[user, showToast])

    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token : string)=>{
        setIsLoading(true)
        showToast('Connecting your bank account...', 'loading')
        try {
            await exchangePublicToken({
                publicToken: public_token, 
                user,
            })
            dismissAllOfType('loading')
            showToast('Bank account connected successfully!', 'success')
            router.push('/')
        } catch (error) {
            console.error('Error exchanging public token:', error)
            dismissAllOfType('loading')
            showToast('Failed to connect bank account. Please try again.', 'error')
            setIsLoading(false)
        }
    },[user, router, showToast, dismissAllOfType])


    const config: PlaidLinkOptions = {
        token,
        onSuccess
    }

    const { open, ready } = usePlaidLink(config)

    const isDisabled = !ready || isLoading || !token

    return (
        <>
        {
            variant === 'primary' ? (
                <Button 
                    onClick={() => open()}
                    disabled={isDisabled}
                    className='plaidlink-primary'
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" /> &nbsp; Connecting...
                        </>
                    ) : !token ? (
                        <>
                            <Loader2 size={20} className="animate-spin" /> &nbsp; Loading...
                        </>
                    ) : 'Connect Bank'}
                </Button>
            ) : variant === 'ghost' ? (
                <Button onClick={() => open()} variant='ghost' disabled={isDisabled} className='plaidlink-ghost'>
                    {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Image 
                            src='/icons/connect-bank.svg'
                            alt='connect bank'
                            width={24}
                            height={24} />
                    )}
                    <p className='hidden xl:block text-[16px] font-semibold text-black-2'>Connect Bank</p>
                </Button>
            ) : (
                <Button onClick={() => open()} disabled={isDisabled} className='plaidlink-default'>
                    {isLoading ? (
                        <Loader2 size={20} className="animate-spin" />
                    ) : (
                        <Image 
                            src='/icons/connect-bank.svg'
                            alt='connect bank'
                            width={24}
                            height={24} />
                    )}
                    <p className='text-[16px] font-semibold text-black-2'>Connect Bank</p>
                </Button>
            )
        }
        </>
    )
}

export default PlaidLink