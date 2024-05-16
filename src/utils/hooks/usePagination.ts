import React, {useMemo} from 'react'
// import  { DotsThree } from '@phosphor-icons/react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    siblingCount?: number;
  }


  export const DOTS = '...';


  export const usePagination = ({
    totalPages,
    siblingCount = 1, // Default value for siblingCount
    currentPage,
  }: PaginationProps): (number | string)[] => {
    const range = (start : number, end : number): number[] => {
        const length = end - start + 1;
        return Array.from({ length }, (_, idx) => idx + start);
      };

    const paginationRange = useMemo(() => {
 
        const leftSiblingIndex = Math.max(currentPage - siblingCount, 1); 
        const rightSiblingIndex = Math.min(
          currentPage + siblingCount,
          totalPages
        ); 
    
        const shouldShowLeftDots = leftSiblingIndex > 1;
        const shouldShowRightDots = rightSiblingIndex < totalPages;
        const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    
        if (shouldShowLeftDots && shouldShowRightDots) {
            return [DOTS, ...middleRange, DOTS];
            } else if (!shouldShowLeftDots && shouldShowRightDots) {
            return [...middleRange, DOTS];
            } else if (shouldShowLeftDots && !shouldShowRightDots) {
            return [DOTS, ...middleRange];
            }

        return range(1, totalPages);
      }, [totalPages, siblingCount, currentPage]);
    
      return paginationRange;
    };
