import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import NodeRSA from "node-rsa";
import Navbar from "~/components/Navbar";
import { api } from "~/utils/api";
import { publicKey } from "~/helpers";
import UserInterest from "~/components/UserInterest";
import Pagination from "~/components/Pagination";
import {toast} from "react-toastify";
import { useRouter, useSearchParams } from 'next/navigation';


export default function Home() {
  const searchParams = useSearchParams();
  const paramsObject = Object.fromEntries(searchParams.entries());
  const [currentPage, setCurrentPage] = useState(paramsObject.page ? Number(paramsObject.page) : 1);
  const perPageLimit = 10
  const {data: categoriesData, isLoading, isError} = api.category.getAll.useQuery({limit: perPageLimit, page: currentPage, });

  if(isError){
    toast.error(`Failed to fetch categories, please try again later: ${isError}`);
  }

  useEffect(()=>{
    setCurrentPage(paramsObject.page ? Number(paramsObject.page) : 1);
  },[[paramsObject]])

  return (
    <>
      <Navbar />
      {/* {isLoading ? <div></div> } */}
      <div className='flex justify-center mt-10 mb-10'>
      <div className="rounded-20 px-15 border-black border w-2/5">
        <p className='font-semibold text-32 mt-10 text-center'>Please mark your interests!</p>
        <p className='text-center mt-[23px]'>We will keep you notified.</p>
        <p className='font-medium text-xl mt-[37px] mb-[28px]'>My saved interests!</p>
          {isLoading ?  
            <div className="flex justify-center items-center mt-10 mb-10">
                <span className="loader w-10 h-10 text-center block"></span>
            </div> : <>
          <div className='flex flex-col gap-25px mb-[67px]'>
            {categoriesData?.categories?.map(categoryData => {
              return(
                <UserInterest key={categoryData.id} category={categoryData} />
              )
            })}
        
          </div> 
          {categoriesData?.totalCategories && <div className="pagination mb-[72px]">
        
            {/* <Pagination currentPage={currentPage} sibilingCount={paginationSibilingCount} } onPageChange={setCurrentPage} /> */}

            <Pagination
              className="pagination-bar"
              currentPage={currentPage}
              siblingCount={3}
              totalPages={Math.ceil(categoriesData?.totalCategories/perPageLimit)}
              onPageChange={page => setCurrentPage(page)}
            />
          </div> }
        </>}
      </div>
      </div>
    </>
  );
}

