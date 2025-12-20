import { useState, useEffect, useCallback } from 'react'

/**
 * Custom hook for managing data fetching with loading, filtering, and pagination
 * Eliminates duplicate data fetching logic across management pages
 * 
 * @param {Function} fetchFn - The API function to call
 * @param {Object} initialFilters - Initial filter state
 * @param {Array} dependencies - Additional dependencies to trigger refetch
 * @returns {Object} Data fetching state and handlers
 */
export const useDataFetching = (fetchFn, initialFilters = {}, dependencies = []) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtering, setFiltering] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [filters, setFilters] = useState(initialFilters)

  /**
   * Fetch data with current filters and pagination
   */
  const fetchData = useCallback(async (isFiltering = false) => {
    try {
      if (isFiltering) {
        setFiltering(true)
      } else {
        setLoading(true)
      }
      
      setError(null)
      
      const params = {
        page: currentPage.toString(),
        limit: '10',
        ...filters
      }

      const response = await fetchFn(params)
      
      if (response.success || response.data) {
        setData(response.data || response.patients || response.dentists || response.appointments || [])
        setTotalPages(response.totalPages || response.pagination?.pages || 1)
      } else {
        setError(response.message || 'Failed to load data')
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please try again.')
    } finally {
      if (isFiltering) {
        setFiltering(false)
      } else {
        setLoading(false)
        setIsFirstLoad(false)
      }
    }
  }, [fetchFn, currentPage, filters])

  /**
   * Refresh data (refetch with current params)
   */
  const refresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  /**
   * Update filters and reset to page 1
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters(initialFilters)
    setCurrentPage(1)
  }, [initialFilters])

  /**
   * Go to specific page
   */
  const goToPage = useCallback((page) => {
    setCurrentPage(page)
  }, [])

  // Fetch data when filters change
  useEffect(() => {
    if (!isFirstLoad) {
      fetchData(true)
    }
  }, [filters])

  // Fetch data when page changes
  useEffect(() => {
    if (!isFirstLoad) {
      fetchData()
    }
  }, [currentPage])

  // Initial load
  useEffect(() => {
    fetchData()
  }, [...dependencies])

  return {
    data,
    loading,
    filtering,
    error,
    currentPage,
    totalPages,
    filters,
    fetchData,
    refresh,
    updateFilters,
    clearFilters,
    goToPage,
    setData
  }
}

/**
 * Custom hook for managing stats fetching
 * 
 * @param {Function} fetchStatsFn - The API function to fetch stats
 * @param {Object} initialStats - Initial stats state
 * @param {Array} dependencies - Dependencies to trigger refetch
 * @returns {Object} Stats state and refresh function
 */
export const useStatsFetching = (fetchStatsFn, initialStats = {}, dependencies = []) => {
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchStatsFn()
      
      if (response.success || response.data) {
        setStats(response.data || response)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }, [fetchStatsFn])

  useEffect(() => {
    fetchStats()
  }, [...dependencies])

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  }
}
