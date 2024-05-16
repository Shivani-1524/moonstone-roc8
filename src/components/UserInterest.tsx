import React, { useEffect, useState } from 'react'
import checked from '../../public/assets/checked.svg';
import Image from 'next/image'
import { StaticImageData } from 'next/image';
import type { Category } from "../types";
import { api } from '~/utils/api';
import { toast } from 'react-toastify';

type CtgProps = {
    category: Category
  };

const UserInterest = ({category}: CtgProps) => {
    const {title, isInterested, id : categoryId} = category
    const [checkedValue, setCheckedValue] = useState<boolean>(isInterested ?? false)
    const updateCtgs = api.category.updateCategoryInterest.useMutation({
        onError(error ) {
            console.log(error, "error occured ctgs update")
            toast.error(`Error: ${error.message}`);
          }
    });

      const updateInterests = async (changedValue : boolean) => {
        try{
            await updateCtgs.mutateAsync({
                categoryId, 
                isInterested:changedValue
            })
        }catch(e){
            console.log(e, "error occured ctgs update")
            toast.error(`Error occured while updating interests`);
        }
    }

    const handleCheckboxToggle = async (value : boolean) => {
        setCheckedValue(value)
        await updateInterests(value || false)
    }

    useEffect(() => {
        // This will reset the state whenever the category prop changes
        setCheckedValue(isInterested ?? false);
    }, [isInterested]);


    return (
        <div className='flex gap-3 '>
            {checkedValue ? 
            <Image aria-hidden='true' onClick={()=>handleCheckboxToggle(false)} className='cursor-pointer' src={checked as StaticImageData} alt="checked-box" />
            : <div aria-hidden='true' onClick={()=>handleCheckboxToggle(true)} className='w-6 h-6 rounded bg-dark-grey cursor-pointer'></div>}
            <label htmlFor={categoryId}>{title}</label>
            <input id={categoryId} type="checkbox" checked={checkedValue} onChange={()=>handleCheckboxToggle(!checkedValue)} />
        </div>
    )
}

export default UserInterest