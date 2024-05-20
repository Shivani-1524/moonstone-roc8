import React from 'react';
import { usePagination, DOTS } from '../utils/hooks/usePagination';
import { useRouter } from 'next/navigation';

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

  const paginationRange = usePagination({
    currentPage,
    siblingCount,
    totalPages
  });

  if (currentPage === 0 || paginationRange?.length < 2) {
    return null;
  }

  const onNext = () => {
    router.push(`?page=${currentPage + 1}`)
  };

  const onPrevious = () => {
    router.push(`?page=${currentPage - 1}`)
  };

  const onStart = () => {
    router.push(`?page=1`)
  };

  const onEnd = () => {
    router.push(`?page=${totalPages}`)
  };

  const lastPage = paginationRange[paginationRange.length - 1];
  return (
    <div
      className={`flex items-center gap-3 font-medium text-xl text-[#acacac]  ${className ?? ''}`}
    >
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
         
        if (pageNumber === DOTS) {
          return <p key={idx}>...</p>;
        }
		
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