'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import CustomInput from './CustomInput'
import { authFormSchema } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signUp, signIn } from '@/lib/actions/user.actions'
import { useToast } from '@/components/ui/toast'

const AuthForm = ({ type } : { type : string }) => {
    const router = useRouter()
    const { showToast, dismissAllOfType } = useToast()
    const [loading, setLoading] = useState(false)
    const formSchema = authFormSchema(type)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            firstname: "",
            lastname: "",
            country: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setLoading(true)
        showToast('Please wait...', 'loading')
        try {
            if (type === 'sign-up') {
                const newUser = await signUp({
                    firstName: data.firstname!,
                    lastName: data.lastname!,
                    country: data.country!,
                    email: data.email,
                    password: data.password
                })
                if (!newUser) throw new Error('Account creation did not complete. Please try again.')

                dismissAllOfType('loading')
                showToast('Your Horizon account has been created.', 'success')
                // The signup action sets the session cookie. A full navigation
                // ensures the dashboard request is made with that new cookie.
                window.location.assign('/')
            } else {
                const loggedIn = await signIn({
                    email: data.email,
                    password: data.password
                })
                dismissAllOfType('loading')
                if (loggedIn) {
                    showToast('Welcome back! Login successful.', 'success')
                    router.push('/')
                    router.refresh()
                } else {
                    showToast('Invalid email or password. Please try again.', 'error')
                }
            }
        } catch (error) {
            console.error("Form submission error:", error)
            dismissAllOfType('loading')
            showToast(error instanceof Error ? error.message : 'Something went wrong. Please try again.', 'error')
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
                        {type === 'sign-in' ? 'Sign In' : 'Create your Horizon account'}
                    </h1>
                    <p className='text-16 font-normal text-grey-600'>
                        {type === 'sign-in' ? 'Sign in to your account' : 'Register from your country. Banking connections are enabled separately where supported.'}
                    </p>
                </div>
            </header>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {type === 'sign-up' && (
                        <>
                            <div className='flex gap-4'>
                                <CustomInput control={form.control} label='First Name' name='firstname' placeholder='Enter your first name' />
                                <CustomInput control={form.control} label='Last Name' name='lastname' placeholder='Enter your last name' />
                            </div>
                            <CustomInput control={form.control} label='Country' name='country' placeholder='Enter your country' />
                        </>
                    )}
                    <CustomInput control={form.control} label='Email' name='email' placeholder='Enter your email' />
                    <CustomInput control={form.control} label='Password' name='password' placeholder='Enter your password' />
                    <Button type="submit" disabled={loading} className="form-btn">
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" /> &nbsp; Please wait...
                            </>
                        ) : type === 'sign-in' ? 'Sign In' : 'Create Account'}
                    </Button>
                </form>
            </Form>
            <footer className='flex justify-center gap-1'>
                <p className='text-14 font-normal text-gray-600'>
                    {type === 'sign-in' ? "Don't have an account?" : 'Already have an account?'}
                </p>
                <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'}>
                    <p className='form-link'>{type === 'sign-in' ? 'Sign Up' : 'Sign In'}</p>
                </Link>
            </footer>
        </section>
    )
}

export default AuthForm
