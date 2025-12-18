'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export function useDataTable({
  fetchFn,
  initialFilters = {},
  initialSort = { field: '', direction: 'asc' },
  debounceMs = 300
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search
  const debouncedSearch = useDebouncedCallback(
    (value) => {
      setSearchTerm(value);
    },
    debounceMs
  );

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page,
        limit: pagination.limit,
        search: searchTerm,
        sort_field: sort.field,
        sort_direction: sort.direction,
        ...filters
      };

      const response = await fetchFn(params);
      
      setData(response.data);
      setPagination({
        page: response.pagination?.page || page,
        limit: response.pagination?.limit || pagination.limit,
        total: response.pagination?.total || 0
      });
    } catch (err) {
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, pagination.limit, searchTerm, sort, filters]);

  // Tự động fetch khi dependencies thay đổi
  useEffect(() => {
    fetchData(1); // Luôn reset về trang 1 khi filter thay đổi
  }, [searchTerm, filters, sort]);

  const handlePageChange = (newPage) => {
    fetchData(newPage);
  };

  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchData(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (field, direction) => {
    setSort({ field, direction });
  };

  const handleSearch = (searchValue) => {
    debouncedSearch(searchValue);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setSearchTerm('');
    setSort(initialSort);
  };

  const refresh = () => {
    fetchData(pagination.page);
  };

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    sort,
    searchTerm,
    handlePageChange,
    handleLimitChange,
    handleFilterChange,
    handleSortChange,
    handleSearch,
    resetFilters,
    refresh
  };
}