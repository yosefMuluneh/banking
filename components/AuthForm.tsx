'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomInput from './CustomInput'
import { authFormSchema } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signUp, signIn } from '@/lib/actions/user.actions'
import PlaidLink from './PlaidLink'
import { useToast } from '@/components/ui/toast'

const AuthForm = ({ type } : { type : string }) => {
    const router = useRouter()
    const { showToast, dismissAllOfType } = useToast()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)

    const formSchema = authFormSchema(type)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setLoading(true)
        showToast('Please wait...', 'loading')
        try {
            if (type === 'sign-up') {
                const userData = {
                    firstName: data.firstname!,
                    lastName: data.lastname!,
                    address1: data.address1!,
                    city: data.city!,
                    state: data.state!,
                    postalCode: data.postalcode!,
                    dateOfBirth: data.dateOfBirth!,
                    ssn: data.ssn!,
                    email: data.email,
                    password: data.password
                }
                const newUser = await signUp(userData)
                setUser(newUser)
                dismissAllOfType('loading')
                showToast('Account created successfully! Connect your bank to continue.', 'success')
            } else if (type === 'sign-in') {
                const loggedIn = await signIn({
                    email: data.email,
                    password: data.password
                })
                if (loggedIn) {
                    dismissAllOfType('loading')
                    showToast('Welcome back! Login successful.', 'success')
                    router.push('/') // Redirect after successful sign-in
                } else {
                    dismissAllOfType('loading')
                    showToast('Invalid email or password. Please try again.', 'error')
                }
            }
        } catch (error) {
            console.error("Form submission error:", error)
            dismissAllOfType('loading')
            showToast('Something went wrong. Please try again.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='auth-form'>
            <header className='flex flex-col md:gap-8'>
                <Link href='/' className='mb-2 flex cursor-pointer items-center gap-1'>
                    <Image src='/icons/logo.svg' alt='logo' width={34} height={34} />
                    <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'>Horizon</h1>
                </Link>
                <div className='flex flex-col gap-1 md:gap-3'>
                    <h1 className='text-24 lg:text-36 font-semibold text-gray-900'>
                        {user ? 'Link Account' : type === 'sign-in' ? 'Sign In' : 'Sign Up'}
                    </h1>
                    <p className='text-16 font-normal text-grey-600'>
                        {user ? 'Link your account to continue' : type === 'sign-in' ? 'Sign in to your account' : 'Create an account'}
                    </p>
                </div>
            </header>
            {user ? (
                <div className='flex flex-col gap-4'>
                    <PlaidLink user={user} variant='primary' />
                </div>
            ) : ( 
                <>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {type === 'sign-up' && (
                                <>
                                    <div className='flex gap-4'>
                                        <CustomInput control={form.control} label='First Name' name='firstname' placeholder='Enter your first name' />
                                        <CustomInput control={form.control} label='Last Name' name='lastname' placeholder='Enter your last name' />
                                    </div>
                                    <CustomInput control={form.control} label='Address' name='address1' placeholder='Enter your specific address' />
                                    <CustomInput control={form.control} label='City' name='city' placeholder='Enter your city' />
                                    <div className='flex gap-4'>
                                        <CustomInput control={form.control} label='State' name='state' placeholder='Example: TX' />
                                        <CustomInput control={form.control} label='Postal Code' name='postalcode' placeholder='Example: 11023' />
                                    </div>
                                    <div className='flex gap-4'>
                                        <CustomInput control={form.control} label='Date of Birth' name='dateOfBirth' placeholder='YYYY-MM-DD' />
                                        <CustomInput control={form.control} label='SSN' name='ssn' placeholder='Example: 1234' />
                                    </div>
                                </>
                            )}
                            <CustomInput control={form.control} label='Email' name='email' placeholder='Enter your email' />
                            <CustomInput control={form.control} label='Password' name='password' placeholder='Enter your password' />
                            <div className="flex flex-col gap-4">
                                <Button type="submit" disabled={loading} className="form-btn">
                                    {loading ? (
                                        <>
                                            <Loader2 size={20} className="animate-spin" /> &nbsp; Please wait...
                                        </>
                                    ) : type === 'sign-in' ? 'Sign In' : 'Sign Up'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                    <footer className='flex justify-center gap-1'>
                        <p className='text-14 font-normal text-gray-600'>
                            {type === 'sign-in' ? 'Don\'t have an account?' : 'Already have an account?'}
                        </p>
                        <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'}>
                            <p className='form-link'>
                                {type === 'sign-in' ? 'Sign Up' : 'Sign In'}
                            </p>
                        </Link>
                    </footer>
                </>
            )}
        </section>
    )
}

export default AuthForm