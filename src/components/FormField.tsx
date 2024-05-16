import React, {useState} from 'react'

export type StringObject = {
    [key : string]: string;
}

type Props = {
    label: string;
    name: string;
    handleFormChange: (value: React.ChangeEvent<HTMLInputElement>) => void;
    handleKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    formValues: StringObject;
    formErrors: StringObject;
    type?: string;
    formType?: "ToggleShow";
}

const FormField = ({label, name, handleFormChange, formValues, formErrors, type, formType, handleKeyDown} : Props) => {
    const [showToggle, setShowToggle] = useState(false)

  return (
        <div className=''>
            {label ? <p className='mb-7px'>{label}</p> : null}
            {formType !=="ToggleShow" ? 
                 <input onKeyDown={handleKeyDown} type={type || "text"} name={name} value={formValues[name]} className='border border-black rounded-md h-12 px-4 w-full' placeholder='Enter' onChange={handleFormChange} />
                : <div className="relative">
                    <input onKeyDown={handleKeyDown} name={name} onChange={handleFormChange} value={formValues[name]} className='border border-black rounded-md h-12 px-4 pr-16 w-full' type={showToggle ? "text" : "password"} placeholder='Enter' />
                    <p onClick={()=>setShowToggle(prev => !prev)} className='absolute cursor-pointer right-3.5 top-[15px] underline underline-offset-2'>{showToggle ? "Hide" : "Show"}</p>
                </div>
            }
            {formErrors[name] ? <p className='text-red-600 text-sm mt-2'>{formErrors[name]}</p> : null}
        </div>
    
  )
}

export default FormField