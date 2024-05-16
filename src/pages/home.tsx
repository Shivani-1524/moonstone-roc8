import { Check, User } from '@phosphor-icons/react'
import React from 'react'
import Navbar from '~/components/Navbar'
import UserInterest from '~/components/UserInterest'

const home = () => {
  return (
    <div>
      <Navbar />
      <div className='flex justify-center mt-10 mb-10'>
      <div className="rounded-20 px-15 border-black border w-2/5">
        <p className='font-semibold text-32 mt-10 text-center'>Please mark your interests!</p>
        <p className='text-center mt-[23px]'>We will keep you notified.</p>
        <p className='font-medium text-xl mt-[37px] mb-[28px]'>My saved interests!</p>

        <div className='flex flex-col gap-25px mb-[67px]'>
          <UserInterest title="Shoes" value={false}/>
      
        </div> 
        <div className="pagination mb-[72px)"></div> 
      </div>
      

      </div>
     </div>

  )
}

export default home