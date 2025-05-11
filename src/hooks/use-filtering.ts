/**
 * useFiltering Hook
 *
 * A custom hook for handling filtering in lists and tables.
 * Provides a consistent way to handle filtering across the application.
 */

import { useState, useCallback } from 'react';

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

export interface FilterCondition<T extends string> {
  column: T;
  operator: FilterOperator;
  value: any;
}

interface UseFilteringProps<T extends string> {
  initialFilters?: FilterCondition<T>[];
}

interface UseFilteringReturn<T extends string> {
  filters: FilterCondition<T>[];
  addFilter: (filter: FilterCondition<T>) => void;
  updateFilter: (index: number, filter: Partial<FilterCondition<T>>) => void;
  removeFilter: (index: number) => void;
  clearFilters: () => void;
  filterData: <D>(data: D[]) => D[];
}

/**
 * useFiltering hook
 *
 * @param {Object} options - Configuration options
 * @param {FilterCondition[]} options.initialFilters - Initial filter conditions
 * @returns {Object} Filtering state and handlers
 */
export function useFiltering<T extends string>({
  initialFilters = [],
}: UseFilteringProps<T> = {}): UseFilteringReturn<T> {
  const [filters, setFilters] = useState<FilterCondition<T>[]>(initialFilters);

  /**
   * Add a new filter
   */
  const addFilter = useCallback((filter: FilterCondition<T>) => {
    setFilters((prevFilters) => [...prevFilters, filter]);
  }, []);

  /**
   * Update an existing filter
   */
  const updateFilter = useCallback((index: number, filter: Partial<FilterCondition<T>>) => {
    setFilters((prevFilters) => {
      const newFilters = [...prevFilters];
      newFilters[index] = { ...newFilters[index], ...filter };
      return newFilters;
    });
  }, []);

  /**
   * Remove a filter
   */
  const removeFilter = useCallback((index: number) => {
    setFilters((prevFilters) => prevFilters.filter((_, i) => i !== index));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters([]);
  }, []);

  /**
   * Apply filter condition to a value
   */
  const applyFilter = useCallback((value: any, operator: FilterOperator, filterValue: any): boolean => {
    // Handle null or undefined values
    if (value == null) {
      return operator === 'neq' && filterValue != null;
    }

    // Convert to string for string operations
    const stringValue = String(value).toLowerCase();
    const stringFilterValue = filterValue != null ? String(filterValue).toLowerCase() : '';

    switch (operator) {
      case 'eq':
        return value === filterValue;
      case 'neq':
        return value !== filterValue;
      case 'gt':
        return typeof value === 'number' && value > filterValue;
      case 'gte':
        return typeof value === 'number' && value >= filterValue;
      case 'lt':
        return typeof value === 'number' && value < filterValue;
      case 'lte':
        return typeof value === 'number' && value <= filterValue;
      case 'contains':
        return stringValue.includes(stringFilterValue);
      case 'startsWith':
        return stringValue.startsWith(stringFilterValue);
      case 'endsWith':
        return stringValue.endsWith(stringFilterValue);
      default:
        return false;
    }
  }, []);

  /**
   * Filter data based on current filters
   */
  const filterData = useCallback(
    <D>(data: D[]): D[] => {
      // If no filters, return all data
      if (filters.length === 0) {
        return data;
      }

      // Apply all filters (AND logic)
      return data.filter((item) => {
        return filters.every((filter) => {
          const { column, operator, value } = filter;
          const itemValue = (item as any)[column];
          return applyFilter(itemValue, operator, value);
        });
      });
    },
    [filters, applyFilter]
  );

  return {
    filters,
    addFilter,
    updateFilter,
    removeFilter,
    clearFilters,
    filterData,
  };
}