/**
 * useSorting Hook
 * 
 * A custom hook for handling sorting in lists and tables.
 * Provides a consistent way to handle sorting across the application.
 */

import { useState, useCallback, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState<T extends string> {
  column: T | null;
  direction: SortDirection;
}

interface UseSortingProps<T extends string> {
  initialSortColumn?: T | null;
  initialSortDirection?: SortDirection;
  defaultSortColumn?: T | null;
  defaultSortDirection?: SortDirection;
}

interface UseSortingReturn<T extends string> {
  sortState: SortState<T>;
  setSortColumn: (column: T) => void;
  resetSort: () => void;
  getSortIcon: (column: T) => string;
  sortData: <D>(data: D[], sortFn?: (a: D, b: D, column: T, direction: SortDirection) => number) => D[];
}

/**
 * useSorting hook
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.initialSortColumn - Initial sort column
 * @param {SortDirection} options.initialSortDirection - Initial sort direction
 * @param {string} options.defaultSortColumn - Default sort column to reset to
 * @param {SortDirection} options.defaultSortDirection - Default sort direction to reset to
 * @returns {Object} Sorting state and handlers
 */
export function useSorting<T extends string>({
  initialSortColumn = null,
  initialSortDirection = null,
  defaultSortColumn = null,
  defaultSortDirection = 'asc',
}: UseSortingProps<T> = {}): UseSortingReturn<T> {
  const [sortState, setSortState] = useState<SortState<T>>({
    column: initialSortColumn,
    direction: initialSortDirection,
  });

  /**
   * Set sort column and toggle direction if same column is clicked
   */
  const setSortColumn = useCallback((column: T) => {
    setSortState((prevState) => {
      // If clicking the same column, cycle through directions: asc -> desc -> null
      if (prevState.column === column) {
        if (prevState.direction === 'asc') {
          return { column, direction: 'desc' };
        } else if (prevState.direction === 'desc') {
          return { column: null, direction: null };
        } else {
          return { column, direction: 'asc' };
        }
      }
      // If clicking a different column, set to asc
      return { column, direction: 'asc' };
    });
  }, []);

  /**
   * Reset sort to default values
   */
  const resetSort = useCallback(() => {
    setSortState({
      column: defaultSortColumn,
      direction: defaultSortDirection,
    });
  }, [defaultSortColumn, defaultSortDirection]);

  /**
   * Get sort icon for a column
   */
  const getSortIcon = useCallback(
    (column: T): string => {
      if (sortState.column !== column) {
        return '↕️'; // Neutral
      }
      if (sortState.direction === 'asc') {
        return '↑'; // Ascending
      }
      if (sortState.direction === 'desc') {
        return '↓'; // Descending
      }
      return '↕️'; // Neutral
    },
    [sortState]
  );

  /**
   * Sort data based on current sort state
   */
  const sortData = useCallback(
    <D>(
      data: D[],
      sortFn?: (a: D, b: D, column: T, direction: SortDirection) => number
    ): D[] => {
      const { column, direction } = sortState;
      
      // If no sort column or direction, return original data
      if (!column || !direction) {
        return [...data];
      }

      // Clone data to avoid mutating original
      const sortedData = [...data];

      // Sort data
      sortedData.sort((a, b) => {
        // Use custom sort function if provided
        if (sortFn) {
          return sortFn(a, b, column, direction);
        }

        // Default sort implementation
        const aValue = (a as any)[column];
        const bValue = (b as any)[column];

        // Handle undefined or null values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return direction === 'asc' ? -1 : 1;
        if (bValue == null) return direction === 'asc' ? 1 : -1;

        // Sort strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Sort numbers
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Sort dates
        if (aValue instanceof Date && bValue instanceof Date) {
          return direction === 'asc'
            ? aValue.getTime() - bValue.getTime()
            : bValue.getTime() - aValue.getTime();
        }

        // Sort booleans
        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return direction === 'asc'
            ? aValue === bValue ? 0 : aValue ? 1 : -1
            : aValue === bValue ? 0 : aValue ? -1 : 1;
        }

        // Default comparison
        return direction === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });

      return sortedData;
    },
    [sortState]
  );

  return {
    sortState,
    setSortColumn,
    resetSort,
    getSortIcon,
    sortData,
  };
}

/**
 * Usage example:
 * 
 * import { useSorting } from '@/hooks/use-sorting';
 * import { Button } from '@/components/ui/button';
 * import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
 * 
 * // Define column type
 * type UserColumn = 'name' | 'email' | 'role' | 'createdAt';
 * 
 * const SortableTable = ({ users }) => {
 *   const {
 *     sortState,
 *     setSortColumn,
 *     getSortIcon,
 *     sortData,
 *   } = useSorting<UserColumn>({
 *     initialSortColumn: 'name',
 *     initialSortDirection: 'asc',
 *   });
 * 
 *   // Sort data
 *   const sortedUsers = sortData(users);
 * 
 *   return (
 *     <Table>
 *       <TableHeader>
 *         <TableRow>
 *           <TableHead onClick={() => setSortColumn('name')} className="cursor-pointer">
 *             Name {getSortIcon('name')}
 *           </TableHead>
 *           <TableHead onClick={() => setSortColumn('email')} className="cursor-pointer">
 *             Email {getSortIcon('email')}
 *           </TableHead>
 *           <TableHead onClick={() => setSortColumn('role')} className="cursor-pointer">
 *             Role {getSortIcon('role')}
 *           </TableHead>
 *           <TableHead onClick={() => setSortColumn('createdAt')} className="cursor-pointer">
 *             Created At {getSortIcon('createdAt')}
 *           </TableHead>
 *         </TableRow>
 *       </TableHeader>
 *       <TableBody>
 *         {sortedUsers.map((user) => (
 *           <TableRow key={user.id}>
 *             <TableCell>{user.name}</TableCell>
 *             <TableCell>{user.email}</TableCell>
 *             <TableCell>{user.role}</TableCell>
 *             <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
 *           </TableRow>
 *         ))}
 *       </TableBody>
 *     </Table>
 *   );
 * };
 */
