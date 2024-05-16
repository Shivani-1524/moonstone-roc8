import React from 'react';
import { usePagination, DOTS } from '../utils/hooks/usePagination';
import { useRouter } from 'next/navigation';
// import './pagination.scss';

interface PaginationProps {
  onPageChange?: (page: number) => void;
  siblingCount?: number;
  currentPage: number;
  totalPages: number;
  className?: string;
}

const Pagination = (props: PaginationProps) => {
  const {
    siblingCount = 1,
    currentPage,
    totalPages,
    className
  } = props;

  const router = useRouter()
  // const searchParams = useSearchParams()

  const paginationRange = usePagination({
    currentPage,
    siblingCount,
    totalPages
  });

  // If there are less than 2 times in pagination range we shall not render the component
  if (currentPage === 0 || paginationRange?.length < 2) {
    return null;
  }

  const onNext = () => {
    // onPageChange(currentPage + 1);
    router.push(`?page=${currentPage + 1}`)
  };

  const onPrevious = () => {
    // onPageChange(currentPage - 1);
    router.push(`?page=${currentPage - 1}`)
  };

  const onStart = () => {
    // onPageChange(1);
    router.push(`?page=1`)
  };

  const onEnd = () => {
    // onPageChange(totalPages);
    router.push(`?page=${totalPages}`)
  };

  const lastPage = paginationRange[paginationRange.length - 1];
  return (
    <div
      className={`flex items-center gap-3 font-medium text-xl text-[#acacac]  ${className ?? ''}`}
    >
       {/* Left navigation arrow */}
   
      <p
        className={` ${currentPage === 1 ? 'disabled cursor-default' : 'cursor-pointer hover:text-black'}`}
        onClick={onStart}
      >
        {"<<"}
      </p>
      <p
        className={` ${currentPage === 1 ? 'disabled cursor-default' : 'cursor-pointer hover:text-black'}`}
        onClick={onPrevious}
      >
        {"<"}
      </p>
      {paginationRange.map((pageNumber: number | string, idx : number) => {
         
        // If the pageItem is a DOT, render the DOTS unicode character
        if (pageNumber === DOTS) {
          return <p key={idx}>...</p>;
        }
		
        // Render our Page Pills
        return (
          <p
            key={idx}
            className={`${pageNumber === currentPage ? 'text-black' : ''} hover:text-black cursor-pointer`}
            onClick={() =>  router.push(`?page=${pageNumber}`)}
          >
            {pageNumber}
          </p>
        );
      })}
      {/*  Right Navigation arrow */}
      <p
        className={` ${currentPage === lastPage ? 'disabled cursor-default' : 'cursor-pointer hover:text-black'}`}
        onClick={onNext}
      >
        {">"}
      </p>
      <p
        className={` ${currentPage === lastPage ? 'disabled cursor-default' : 'cursor-pointer hover:text-black'}`}
        onClick={onEnd}
      >
        {">>"}
      </p>
    </div>
  );
};

export default Pagination;