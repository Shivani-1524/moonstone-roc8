import React, {useEffect, useState} from 'react'
import { MagnifyingGlass, ShoppingCartSimple, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useRouter } from 'next/navigation';
import { api } from '~/utils/api';
import {toast} from 'react-toastify';
import { deleteCookie, getCookie } from 'cookies-next';
import jwt from 'jsonwebtoken';
import { NameJwtPayload } from '~/auth';
import Carousel from './Carousel';

const Navbar = () => {
  const router = useRouter();
  const [name, setName] = useState("John")


  const {mutate : loginMutate, isPending} = api.user.logoutUser.useMutation({
    onSuccess(data, variables, context) {
      router.push('/login')
    },
    onError(error){
      toast.error(`failed to logout: ${error.message}`);
    }
  })


  const handleLogout = () => {
    deleteCookie("name-token")
    loginMutate()
  }

  const getCurrentCookie = () => {
    const userNameCookie = getCookie("name-token"); 
    if(!userNameCookie){
      return;
    }
    const decoded = jwt.decode(userNameCookie) as NameJwtPayload;
    setName(decoded.name ?? "John")
  }



  useEffect(()=>{
    getCurrentCookie()
  },[])

  return (
    <div>
          <div className="px-8">
        <div className="flex justify-end items-center gap-3 h-36">
          <p onClick={handleLogout} className="text-xs cursor-pointer">Help</p>
          <p className="text-xs">Orders & Returns</p>
          <p className="text-xs">Hi, {name}</p>
        </div>
        <div className="flex justify-between h-16 items-center     ">
          <p className="font-bold text-2xl">ECOMMERCE</p>
          <div className="flex gap-5 ">
            <p className="text-base font-semibold">Categories</p>
            <p className="text-base font-semibold">Sale</p>
            <p className="text-base font-semibold">Clearance</p>
            <p className="text-base font-semibold">New stock</p>
            <p className="text-base font-semibold">Trending</p>
          </div>
          <div className="flex gap-5">
            <MagnifyingGlass size={20} />
            <ShoppingCartSimple size={20} />
          </div>
        </div>
        </div>
        <Carousel />
    </div>
  )
}

export default Navbar