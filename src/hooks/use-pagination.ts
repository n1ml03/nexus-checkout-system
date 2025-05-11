/**
 * usePagination Hook
 * 
 * A custom hook for handling pagination in lists and tables.
 * Provides a consistent way to handle pagination across the application.
 */

import { useState, useMemo, useCallback } from 'react';

interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  siblingsCount?: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  totalPages: number;
  pageItems: number[];
  firstItemIndex: number;
  lastItemIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  getPaginationRange: () => (number | string)[];
}

/**
 * usePagination hook
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.totalItems - Total number of items
 * @param {number} options.initialPage - Initial page number (1-based)
 * @param {number} options.initialPageSize - Initial page size
 * @param {number[]} options.pageSizeOptions - Available page size options
 * @param {number} options.siblingsCount - Number of siblings to show on each side of the current page
 * @returns {Object} Pagination state and handlers
 */
export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  siblingsCount = 1,
}: UsePaginationProps): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  // Calculate total pages
  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / pageSize)), [totalItems, pageSize]);

  // Ensure page is within valid range
  const normalizedPage = useMemo(() => Math.min(Math.max(1, page), totalPages), [page, totalPages]);

  // Update page if it's out of range
  if (page !== normalizedPage) {
    setPage(normalizedPage);
  }

  // Calculate item indices
  const firstItemIndex = useMemo(() => (normalizedPage - 1) * pageSize, [normalizedPage, pageSize]);
  const lastItemIndex = useMemo(() => Math.min(firstItemIndex + pageSize - 1, totalItems - 1), [firstItemIndex, pageSize, totalItems]);

  // Calculate page items (0-based indices)
  const pageItems = useMemo(() => {
    const items = [];
    for (let i = firstItemIndex; i <= lastItemIndex; i++) {
      items.push(i);
    }
    return items;
  }, [firstItemIndex, lastItemIndex]);

  // Check if has previous/next page
  const hasPreviousPage = normalizedPage > 1;
  const hasNextPage = normalizedPage < totalPages;

  // Page navigation handlers
  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(normalizedPage + 1);
    }
  }, [normalizedPage, hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(normalizedPage - 1);
    }
  }, [normalizedPage, hasPreviousPage]);

  const goToFirstPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages]);

  // Set page size and reset to first page
  const setPageSize = useCallback((newPageSize: number) => {
    setPageSizeState(newPageSize);
    setPage(1);
  }, []);

  // Generate pagination range with ellipsis
  const getPaginationRange = useCallback(() => {
    const range: (number | string)[] = [];
    
    // Always show first page
    range.push(1);
    
    // Calculate range around current page
    const rangeStart = Math.max(2, normalizedPage - siblingsCount);
    const rangeEnd = Math.min(totalPages - 1, normalizedPage + siblingsCount);
    
    // Add ellipsis after first page if needed
    if (rangeStart > 2) {
      range.push('...');
    }
    
    // Add pages in range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (rangeEnd < totalPages - 1) {
      range.push('...');
    }
    
    // Add last page if not already included
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    return range;
  }, [normalizedPage, totalPages, siblingsCount]);

  return {
    page: normalizedPage,
    pageSize,
    totalPages,
    pageItems,
    firstItemIndex,
    lastItemIndex,
    hasPreviousPage,
    hasNextPage,
    setPage,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    getPaginationRange,
  };
}