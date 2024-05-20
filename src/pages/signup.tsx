import React, { useState, useEffect } from 'react'
import FormField from '~/components/FormField'
import Navbar from '~/components/Navbar'
import OtpInput from '~/components/OtpInput';
import { createUserSchema } from '~/types';
import { api } from '~/utils/api';
import { validateForm, encryptDataRSA, PasswordRegex } from '~/helpers';
// import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation'
import {toast} from "react-toastify";

const Signup = () => {
  const router = useRouter()
    type SignupForm = {
      email: string;
      password: string;
      name: string;
    };

    const initialValues:SignupForm = {
      email: "",
      password: "",
      name: ""
    }
  
    const [formSubmit, setFormSubmit] = useState(false)
    const [signupFormValues, setSignupFormValues] = useState(initialValues)
    const [submitErrors, setSubmitErrors] = useState("")
    const [signupFormErrors, setSignupFormErrors] = useState({})
    const {mutate : signupMutate, isPending} = api.user.createUser.useMutation({
      onSuccess(data, variables, context) {
        const {otpToken} = data
        router.push(`/auth/${otpToken}`)
        toast.success("OTP sent, please check your email for an OTP code")
      },
      onError(error){
        setSignupFormValues(initialValues)
        setSubmitErrors(error.message)
        toast.error(`Failed to signup: ${error.message}`);
      }
    })
    

    
  const handleFormChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setSignupFormValues(prev => ({...prev, [name]: value.trim()}))
  }

  const handleSubmit = () => {
    const validation = createUserSchema.safeParse(signupFormValues)
    if(!validation.success){
      setSignupFormErrors(validateForm(validation.error.issues))
    }else if(!PasswordRegex.test(signupFormValues.password)){
      setSignupFormErrors({password: "Password must contain atleast 6 characters, one digit and one special character"})
    }else{
      setSignupFormErrors({})
    }
    setFormSubmit(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSubmit();
    }
}

  
  const submitSignupForm = () => {
    const encryptedPswd = encryptDataRSA(signupFormValues?.password)
    const _signupFormValues = {...signupFormValues, password: encryptedPswd}
    signupMutate(_signupFormValues)
  }

  useEffect(()=>{
    if(Object.keys(signupFormErrors).length === 0 && formSubmit){
      submitSignupForm()
      setFormSubmit(false)
    }
  },[signupFormErrors, formSubmit])




  return (
    <div className=''>
      <Navbar />
      <div className='flex justify-center mt-10 mb-10'>
        <div className="rounded-20 px-15 border-black border w-2/5">
          <p className='font-semibold text-32 mt-10 text-center mb-8'>Create your account</p>
          <div className="flex flex-col gap-8">
            <FormField handleKeyDown={handleKeyDown} label="Name" name="name" handleFormChange={handleFormChange} formValues={signupFormValues} formErrors={signupFormErrors} />
            <FormField handleKeyDown={handleKeyDown} label="Email" name="email" handleFormChange={handleFormChange} formValues={signupFormValues} formErrors={signupFormErrors} />
            <FormField handleKeyDown={handleKeyDown} label="Password" name="password" type="password" handleFormChange={handleFormChange} formValues={signupFormValues} formErrors={signupFormErrors} />
            {submitErrors ? <p className='text-red-600 text-sm mt-2'>{submitErrors}</p> : null}
          </div>
          {/* <button onClick={handleSubmit} className='mt-10 rounded-md bg-black text-white w-full h-14 '> <p className='text-center font-medium'></p> </button> */}
          <button disabled={isPending} onClick={handleSubmit} className='mt-10 rounded-md bg-black text-white w-full h-14 flex justify-center items-center'> 
                {isPending ? <span className="loader white w-5 h-5 "></span> :  <p className='text-center font-medium'>  CREATE ACCOUNT</p>} 
            </button>
          <div className='bg-black h-px w-full mt-[29px] mb-[31px]'></div>

          <p className='text-center mb-[131px]'>Have an Account? <span onClick={()=>router.push("/login")} className='font-medium cursor-pointer hover:underline'>LOGIN</span> </p>
        </div>

      </div>
    </div>
  )
}

export default Signup