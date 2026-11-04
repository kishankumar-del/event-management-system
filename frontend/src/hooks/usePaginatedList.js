import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useDebounce } from './useDebounce';

/**
 * Custom hook to handle paginated, searchable, and filtered lists
 * Synchronizes list state with URL query parameters for shareability
 */
export function usePaginatedList(endpoint, defaultParams = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial values from URL or defaults
  const initialPage = parseInt(searchParams.get('page'), 10) || defaultParams.page || 1;
  const initialLimit = parseInt(searchParams.get('limit'), 10) || defaultParams.limit || 10;
  const initialSearch = searchParams.get('search') || defaultParams.search || '';
  const initialSort = searchParams.get('sort') || defaultParams.sort || '-createdAt';

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [filters, setFilters] = useState(() => {
    const f = { ...defaultParams };
    delete f.page;
    delete f.limit;
    delete f.search;
    delete f.sort;
    // Overlay query parameters from URL
    for (const [key, value] of searchParams.entries()) {
      if (!['page', 'limit', 'search', 'sort'].includes(key)) {
        f[key] = value;
      }
    }
    return f;
  });
  const [sort, setSort] = useState(initialSort);

  const debouncedSearch = useDebounce(searchInput, 350);

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state back to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page);
    if (limit !== 10) params.set('limit', limit);
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (sort && sort !== '-createdAt') params.set('sort', sort);

    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    setSearchParams(params, { replace: true });
  }, [page, limit, debouncedSearch, sort, filters, setSearchParams]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    query.set('page', page);
    query.set('limit', limit);
    if (debouncedSearch) query.set('search', debouncedSearch);
    if (sort) query.set('sort', sort);

    Object.entries(filters).forEach(([k, v]) => {
      if (v) query.set(k, v);
    });

    try {
      const res = await api.get(`${endpoint}?${query.toString()}`);
      setData(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, limit, debouncedSearch, sort, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset to page 1 whenever search or filters change
  const handleFilterChange = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearchInput(val);
    setPage(1);
  };

  return {
    data,
    total,
    totalPages,
    page,
    limit,
    searchInput,
    filters,
    sort,
    loading,
    error,
    setPage,
    setLimit,
    setSort,
    setSearch: handleSearchChange,
    setFilter: handleFilterChange,
    refetch: fetchData,
  };
}

