import React from 'react'
import { FormControl, FormField, FormLabel, FormMessage } from './ui/form'
import { Input } from './ui/input'
import { z } from 'zod'
import { authFormSchema } from '@/lib/utils';
import { Control, FieldPath } from 'react-hook-form';

const formSchema = authFormSchema('sign-up')

interface CustomInputProps {
    control: Control<z.infer<typeof formSchema>>;
    name: FieldPath<z.infer<typeof formSchema>>;
    label: string;
    placeholder: string;
}

const CustomInput = ({ control, name, label, placeholder } : CustomInputProps) => {

    
  return (
    <FormField
        control={control}
        name={name}
        render={({ field }) => (
            <div className='form-item'>
            <FormLabel className='form-label'>{label}</FormLabel>
            <div className='flex flex-col w-full'>
                <FormControl>
                    <Input
                        {...field}
                        type={name}
                        placeholder={placeholder}
                        className='input-class'
                    />
                </FormControl>
                <FormMessage className='form-message  mt-2' />
            </div>
            </div>
        )}
        />
  )
}

export default CustomInput