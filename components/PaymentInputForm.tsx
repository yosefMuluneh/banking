import React from 'react'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { BankDropdown } from './BankDropdown'
import { transferFormSchema } from '@/lib/utils'
import { Control, FieldPath, SetFieldValue } from 'react-hook-form'
import { z } from 'zod'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'



const transferSchema = transferFormSchema()
interface PaymentTransferInputprops {
    control : Control<z.infer<typeof transferSchema>>,
    label:string,
    descritption?: string,
    accounts?:Account[],
    value?: SetFieldValue<any>,
    otherStyles: string
    name:FieldPath<z.infer<typeof transferSchema>>,
    placeholder?:string
  }

const PaymentInputForm = ({control,label,descritption,accounts=[],value='',otherStyles, name,placeholder=''} : PaymentTransferInputprops) => {
  return (
    <FormField
          control={control}
          name={name}
          render={({ field }) => (
    <FormItem className="border-t border-gray-200">
    <div className={`payment-transfer_form-item ${otherStyles}`}>
      <div className="payment-transfer_form-content">
        <FormLabel className="text-14 font-medium text-gray-700">
            {label}
        </FormLabel>
        {
           ( name === 'name'  || name === 'senderBank' )&&
            <FormDescription className="text-12 font-normal text-gray-600">
            {descritption}
          </FormDescription>
        }
        
      </div>
      <div className="flex w-full flex-col">
        <FormControl>
            {
                name === 'senderBank' ? 
                <BankDropdown
                    accounts={accounts}
                    setValue={value}
                    otherStyles={`${otherStyles} !w-full`}
                /> :
              name === 'name' ?  
              <Textarea
                placeholder={placeholder}
                className="input-class"
                {...field}
                /> :
              <Input
                placeholder={placeholder}
                className="input-class"
                {...field}
                />
            }
          
        </FormControl>
        <FormMessage className="text-12 text-red-500" />
      </div>
    </div>
  </FormItem>
          )}
          />
  )
}

export default PaymentInputForm