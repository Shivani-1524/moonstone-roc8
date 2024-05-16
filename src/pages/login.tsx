import { log } from 'console';
import React, { useEffect, useState } from 'react'
import Navbar from '~/components/Navbar'
import { EmailRegex } from '~/helpers';
import FormField from '~/components/FormField';
import { api } from '~/utils/api';
import { encryptDataRSA, validateForm } from '~/helpers';
import { loginUserSchema } from '~/types';
import { useRouter } from 'next/navigation';
import { setToken } from '~/utils/api';
import {toast} from "react-toastify";

export type LoginErrors = {
  email?: string;
  password?: string;
};

const Login = () => {

  const router = useRouter()

  type LoginForm = {
    email: string;
    password: string;
  };

  const initialValues:LoginForm = {
    email: "",
    password: ""
  }

  const [formSubmit, setFormSubmit] = useState(false)
  const [loginFormValues, setLoginFormValues] = useState(initialValues)
const [submitErrors, setSubmitErrors] = useState("")
  const [loginFormErrors, setLoginFormErrors] = useState({})
    const {mutate : loginMutate, isPending} = api.user.loginUser.useMutation({
    onSuccess(data, variables, context) {
      setToken(data?.token)
      router.push('/')
    },
    onError(error){
      console.log("meowie :: 123 :: ",error)
      toast.error(`${error.message}`);
      setSubmitErrors(error.message)
      setLoginFormErrors({})
      setLoginFormValues(initialValues)
    }
  })

  const handleFormChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setLoginFormValues(prev => ({...prev, [name]: value.trim()}))
  }

  const handleSubmit = () => {
    const validation = loginUserSchema.safeParse(loginFormValues)
    if(!validation.success){
      setLoginFormErrors(validateForm(validation.error.issues))
    }else{
      setLoginFormErrors({})
    }
    setFormSubmit(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSubmit();
    }
}

 

  const submitLoginForm = () => {
    const encryptedPswd = encryptDataRSA(loginFormValues?.password)
    const _loginFormValues = {...loginFormValues, password: encryptedPswd}
    loginMutate(_loginFormValues)
  }

  useEffect(()=>{
    console.log("meowiww");
    
    if(Object.keys(loginFormErrors).length === 0 && formSubmit){
      submitLoginForm()
      setFormSubmit(false)
    }
  },[loginFormErrors, formSubmit])

  return (
    <div className='mb-10'>
      <Navbar />
        <div className='flex justify-center mt-10 '>
        <div className="rounded-20 px-15 border-black border w-2/5">
          <p className='font-semibold text-32 mt-10 text-center'>Login</p>
          <p className='font-medium text-2xl text-center mt-9'>Welcome back to ECOMMERCE</p>
          <p className='text-base text-center mt-[13px] mb-[31px]'>The next gen business marketplace</p>
          <div className="flex flex-col gap-8">
            <FormField label="Email" name="email" handleFormChange={handleFormChange} handleKeyDown={handleKeyDown} formValues={loginFormValues} formErrors={loginFormErrors} />
            <FormField label="Password" name="password" handleFormChange={handleFormChange} handleKeyDown={handleKeyDown} formValues={loginFormValues} formErrors={loginFormErrors} formType="ToggleShow"/>
            {submitErrors ? <p className='text-red-600 text-sm mt-2'>{submitErrors}</p> : null}
          </div>
            <button disabled={isPending} onClick={handleSubmit} className='mt-10 rounded-md bg-black text-white w-full h-14 flex justify-center items-center'> 
                {isPending ? <span className="loader white w-5 h-5 "></span> :  <p className='text-center font-medium'> LOGIN</p>} 
            </button>
          <div className='bg-black h-px w-full mt-[29px] mb-[31px]'></div>
          <p className='text-center mb-[51px]'>Don&apos;t have an Account? <span onClick={()=>router.push("/signup")} className='font-medium cursor-pointer hover:underline'>SIGN UP</span> </p>
        </div>
      </div>
      
    </div>
  )
}

export default Login