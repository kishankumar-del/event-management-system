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

  const defaultPage = defaultParams.page || 1;
  const defaultLimit = defaultParams.limit || 10;
  const defaultSort = defaultParams.sort || '-createdAt';
  const defaultSearch = defaultParams.search || '';

  // Read initial values from URL or defaults
  const initialPage = parseInt(searchParams.get('page'), 10) || defaultPage;
  const initialLimit = parseInt(searchParams.get('limit'), 10) || defaultLimit;
  const initialSearch = searchParams.get('search') || defaultSearch;
  const initialSort = searchParams.get('sort') || defaultSort;

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

  // Sync state back to URL query parameters ONLY when different from defaults
  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1 && page !== defaultPage) params.set('page', page);
    // Only set limit if user explicitly provided a non-default limit in URL
    if (searchParams.has('limit') && limit !== defaultLimit) params.set('limit', limit);
    if (debouncedSearch && debouncedSearch !== defaultSearch) params.set('search', debouncedSearch);
    if (sort && sort !== defaultSort) params.set('sort', sort);

    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== defaultParams[k]) params.set(k, v);
    });

    const currentString = searchParams.toString();
    const newString = params.toString();

    // Only update if query parameters actually changed to prevent URL clutter and loops
    if (currentString !== newString) {
      setSearchParams(params, { replace: true });
    }
  }, [page, limit, debouncedSearch, sort, filters, defaultPage, defaultLimit, defaultSort, defaultSearch, searchParams, setSearchParams]);

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

