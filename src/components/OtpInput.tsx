import React, {useMemo, Fragment, useRef, useEffect, useState} from 'react'
import { RE_DIGIT } from '~/helpers';

export type Props = {
    otp: string[];
    valueLength: number;
    onChange: (value: string[]) => void;
    submitForm: () => void;
  };

  let currentOtpIndex:number = 0

const OtpInput = ({ otp, valueLength, onChange, submitForm }: Props) => {

    const inputRef = useRef<HTMLInputElement>(null)
    const [activeOtpIndex, setActiveOtpIndex] = useState<number>(0)

    const handleOnChange = ({target}:React.ChangeEvent<HTMLInputElement>): void => {
        const {value} = target;
        console.log(value, "the value u se", currentOtpIndex);
        
        const newOTP: string[] = [...otp]
        newOTP[currentOtpIndex] = value.substring(value.length - 1);

        if (!value) {
            setActiveOtpIndex(currentOtpIndex - 1);
        } else {
            setActiveOtpIndex(currentOtpIndex + 1);
        }

        onChange(newOTP)
        console.log(newOTP, "look")
       

    }

    const handleOnKeyDown = ({key}: React.KeyboardEvent<HTMLInputElement> , index: number) => {
        currentOtpIndex = index
        console.log(currentOtpIndex, "the current index");
        
        if(key === 'Backspace' && otp[index] === ''){
            setActiveOtpIndex(currentOtpIndex-1)    
        }else if(key === 'ArrowRight'){
            setActiveOtpIndex(currentOtpIndex+1)
        }else if(key === 'ArrowLeft'){
            setActiveOtpIndex(currentOtpIndex-1)
        }
        else if(key === 'Enter'){
            submitForm()
        }
    }

    const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('Text');
        const numbers = pastedData.replace(/\D/g, ''); // Remove non-digit characters
        let newOtp = [...otp];
        let newIndex = index;

        for (let i = 0; i < numbers.length && newIndex < valueLength; i++, newIndex++) {
            newOtp[newIndex] = numbers[i] || ''; // Fallback to empty string if undefined
        }

        onChange(newOtp);
        setActiveOtpIndex(Math.min(newIndex, valueLength - 1)); // Update active index, not exceeding the max index
    }

    useEffect(()=>{
        inputRef.current?.focus();
    },[activeOtpIndex])


  return (
    <div className="flex w-full gap-3 ">
        {otp.map((_, idx) => {
            return (
                <Fragment key={idx}>
                    <input
                        ref={idx===activeOtpIndex ? inputRef : null}
                        type="number"
                        value={otp[idx]}
                        onPaste={(e)=>handlePasteEvent(e, idx)}
                        onChange={handleOnChange}
                        onKeyDown={(e)=>{
                            ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                            handleOnKeyDown(e, idx)}}
                        className='w-46px h-12 border rounded-md bg-transparent outline-none text-center font-semibold text-xl border-medium-grey focus:border-gray-700 focus:text-gray-700 text-gray-400 transition spin-button-none'
                    />
                    {/* {idx === otp.length - 1? null : (
                        <span className='' />
                    )} */}
                
                </Fragment>
            )
        }
      
        )}
  </div>
  )
}

export default OtpInput