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
  const paginationSibilingCount = 3;
  const {data: categoriesData, isLoading, isError} = api.category.getAll.useQuery({limit: perPageLimit, page: currentPage, }, {
    // staleTime: Infinity, // Ensures data is fetched only once and then cached
    // cacheTime: Infinity // Ensures cache does not get garbage collected
  });

  if(isError){
    toast.error(`Failed to fetch categories, please try again later: ${isError}`);
  }

  useEffect(()=>{
    console.log("i go exedc", searchParams);
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
                <UserInterest category={categoryData} />
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


// <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
// <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
//   Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
// </h1>
// <input type="password" onChange={(e)=>setUserPassword(e.target.value)} />
// <button onClick={()=>handleSignupUser({name: "santy", email: "shivanipothirajan@gmail.com", password: encryptDataRSA(userPassword)})}>Submit</button>
// <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
//   <Link
//     className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
//     href="https://create.t3.gg/en/usage/first-steps"
//     target="_blank"
//   >
//     <h3 className="text-2xl font-bold">First Steps →</h3>
//     <div className="text-lg">
//       Just the basics - Everything you need to know to set up your
//       database and authentication.
//     </div>
//   </Link>
//   <Link
//     className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
//     href="https://create.t3.gg/en/introduction"
//     target="_blank"
//   >
//     <h3 className="text-2xl font-bold">Documentation →</h3>
//     <div className="text-lg">
//       Learn more about Create T3 App, the libraries it uses, and how
//       to deploy it.
//     </div>
//   </Link>
// </div>
// <p className="text-2xl text-white">
//   {/* {hello.data ? hello.data.greeting : "Loading tRPC query..."} */}
// </p>
// </div>
