'use client'
import { GetStaticPathsContext, GetStaticPropsContext } from 'next'
import React, {useEffect, useState, FC} from 'react'
import Navbar from '~/components/Navbar'
import OtpInput from '~/components/OtpInput'
import { idSchema } from '~/types'
import { api } from '~/utils/api'
import { useRouter } from 'next/router';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { encryptDataRSA } from '~/helpers'
import { setToken } from '~/utils/api'
import {toast} from "react-toastify";



interface EmailJwtPayload {
  email: string
  iat: number
  exp: number
}

const OtpPage = () => {
  const router = useRouter();

  const tokenId:string | undefined = router.query.tokenId as string | undefined;

  const [otp, setOtp] = useState<string[]>(new Array(8).fill(""));
  const [userEmail, setUserEmail] = useState("")

  const {mutate : otpVerifyMutate} = api.user.verifyOtp.useMutation({
      onSuccess(data, variables, context) {
        setToken(data?.token)
        router.push("/").catch(e => toast.error("Invalid or expired token"))
      },
      onError(error, code){
        toast.error(error.message);
      }
    })

    const handleOtpVerify = () => {
      if(!tokenId) return Error("Token Not Found")
      const otpValue = otp.join('')
      if(otpValue.length !== 8) return toast.error("Invalid OTP")
      const encryptedOtp = encryptDataRSA(otpValue)
      otpVerifyMutate({
        token: tokenId,
        otp: encryptedOtp
      })
    }

    function obscureEmail(email: string): string {
      const parts: string[] = email.split('@');
      const username: string = parts[0] ?? "";
      const domain: string = parts[1] ?? "";
      
      let obscuredUsername: string;
      if (username.length > 3) {
          obscuredUsername = username.substring(0,3) + '*'.repeat(3);
      } else {
          obscuredUsername = username[0] + '*'.repeat(3);
      }
      
      return obscuredUsername + '@' + domain;
  }

    const handleOtpJwtToken = (token :string) => {
      try{
       const decoded = jwt.decode(token) as EmailJwtPayload | null;
       if (!decoded) {
        throw new Error("Invalid or expired token");
      }
       setUserEmail(obscureEmail(decoded.email))
      }catch(err){
        console.log("JWT for OTP Error - ",err)
        //todo: throw toast saying token expired or send state via route
        router.push('/signup').catch(e => toast.error("Invalid or expired token"))
      }
    }

    useEffect(()=>{
      if(tokenId){
        handleOtpJwtToken(tokenId)
      }
    },[tokenId])

    
  return (
    <div>
        <Navbar />
          <div className='flex justify-center mt-10'>
              <div className="rounded-20 px-[62px] border-black border w-2/5">
                <p className='font-semibold text-32 mt-10 text-center mb-8'>Verify your email</p>
                <p className='text-center mt-8'>Enter the 8 digit code you have received on <br /> <span className='font-medium'>{userEmail || ""}</span></p>

                <div className='mt-[46px] mb-16'>
                    <p className='mb-[7px]'>Code</p>
                    <OtpInput otp={otp} valueLength={8} onChange={(value: string[])=>{
                      setOtp(value)}} submitForm={()=>handleOtpVerify()}/>
                </div>
                <button onClick={handleOtpVerify} className='rounded-md bg-black text-white w-full h-14 mb-15'> <p className='text-center font-medium'>VERIFY</p> </button>
              </div>
          </div>
    </div>
  )
}

export default OtpPage

