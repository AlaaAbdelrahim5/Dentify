import { useState, useEffect, useCallback, useRef } from 'react';
import { showErrorAlert } from '../utils/errorUtils';

/**
 * Custom hook for data fetching with loading and refreshing states
 * @param {Function} fetchFunction - The async function to fetch data
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback after successful fetch
 * @param {Function} options.onError - Custom error handler
 * @param {boolean} options.fetchOnMount - Whether to fetch on component mount (default: true)
 * @returns {Object} { data, loading, refreshing, error, refetch, onRefresh }
 */
export const useDataFetch = (fetchFunction, options = {}) => {
  const {
    onSuccess,
    onError,
    fetchOnMount = true,
    errorMessage = 'Failed to load data'
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(fetchOnMount);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Use refs to avoid dependency issues with callbacks
  const fetchFunctionRef = useRef(fetchFunction);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Update refs when values change
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await fetchFunctionRef.current();
      setData(result);

      if (onSuccessRef.current) {
        onSuccessRef.current(result);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
      
      if (onErrorRef.current) {
        onErrorRef.current(err);
      } else {
        showErrorAlert(err, errorMessage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchOnMount, fetchData]);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch,
    onRefresh
  };
};

/**
 * Custom hook for managing multiple data sources
 * @param {Array} fetchFunctions - Array of async functions to fetch data
 * @returns {Object} { data, loading, refreshing, error, refetch, onRefresh }
 */
export const useMultiDataFetch = (fetchFunctions = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchFunctionsRef = useRef(fetchFunctions);
  
  useEffect(() => {
    fetchFunctionsRef.current = fetchFunctions;
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const results = await Promise.allSettled(fetchFunctionsRef.current.map(fn => fn()));
      const processedData = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          console.error(`Error in fetch function ${index}:`, result.reason);
          return null;
        }
      });

      setData(processedData);
    } catch (err) {
      console.error('Error fetching multiple data sources:', err);
      setError(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData(false);
  }, [fetchData]);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch,
    onRefresh
  };
};
