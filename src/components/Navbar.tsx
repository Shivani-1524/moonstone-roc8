import React from 'react'
import { MagnifyingGlass, ShoppingCartSimple, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";


const Navbar = () => {
  return (
    <div>
          <div className="px-8">
        <div className="flex justify-end items-center gap-3 h-36">
          <p className="text-xs">Help</p>
          <p className="text-xs">Orders & Returns</p>
          <p className="text-xs">Hi, John</p>
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
        <div className="flex bg-light-grey h-36 gap-5 justify-center items-center">
        <CaretLeft size={10} />
        <p className="text-sm font-medium">Get 10% off on business sign up</p>
        <CaretRight size={10} />
        </div>
    </div>
  )
}

export default Navbar