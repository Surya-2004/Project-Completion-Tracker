import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

// Global cache to store fetched data
const dataCache = new Map();
const cacheTimestamps = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useDataManager = (endpoint, options = {}) => {
  const {
    dependencies = [],
    immediate = true,
    cacheKey = endpoint,
    forceRefresh = false
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const isDataFresh = (timestamp) => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const fetchData = async (force = false) => {
    // Check cache first (unless force refresh is requested)
    if (!force && dataCache.has(cacheKey)) {
      const cachedData = dataCache.get(cacheKey);
      const timestamp = cacheTimestamps.get(cacheKey);
      
      if (isDataFresh(timestamp)) {
        setData(cachedData);
        setLoading(false);
        setError(null);
        return;
      }
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(endpoint, {
        signal: abortControllerRef.current.signal
      });

      // Cache the data
      dataCache.set(cacheKey, response.data);
      cacheTimestamps.set(cacheKey, Date.now());

      setData(response.data);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
        setError(err.response?.data?.error || 'Failed to fetch data');
        console.error('Error fetching data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateData = (updater) => {
    setData(prevData => {
      const newData = typeof updater === 'function' ? updater(prevData) : updater;
      
      // Update cache
      dataCache.set(cacheKey, newData);
      cacheTimestamps.set(cacheKey, Date.now());
      
      return newData;
    });
  };

  const invalidateCache = () => {
    dataCache.delete(cacheKey);
    cacheTimestamps.delete(cacheKey);
  };

  const refreshData = () => {
    return fetchData(true);
  };

  useEffect(() => {
    if (immediate) {
      fetchData(forceRefresh);
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [endpoint, immediate, forceRefresh, ...dependencies]);

  return {
    data,
    loading,
    error,
    fetchData,
    updateData,
    invalidateCache,
    refreshData
  };
};

// Utility function to invalidate specific cache entries
export const invalidateCache = (cacheKey) => {
  dataCache.delete(cacheKey);
  cacheTimestamps.delete(cacheKey);
};

// Utility function to clear all cache
export const clearAllCache = () => {
  dataCache.clear();
  cacheTimestamps.clear();
};

// Hook for managing multiple data sources
export const useMultiDataManager = (endpoints) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isDataFresh = (timestamp) => {
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const promises = endpoints.map(async ({ key, endpoint, cacheKey = endpoint }) => {
        // Check cache first
        if (dataCache.has(cacheKey)) {
          const cachedData = dataCache.get(cacheKey);
          const timestamp = cacheTimestamps.get(cacheKey);
          
          if (isDataFresh(timestamp)) {
            return { key, data: cachedData };
          }
        }

        const response = await api.get(endpoint);
        
        // Cache the data
        dataCache.set(cacheKey, response.data);
        cacheTimestamps.set(cacheKey, Date.now());
        
        return { key, data: response.data };
      });

      const results = await Promise.all(promises);
      const newData = {};
      
      results.forEach(({ key, data }) => {
        newData[key] = data;
      });

      setData(newData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
      console.error('Error fetching multiple data sources:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateData = (key, updater) => {
    setData(prevData => {
      const newData = { ...prevData };
      newData[key] = typeof updater === 'function' ? updater(prevData[key]) : updater;
      return newData;
    });
  };

  const refreshData = () => {
    return fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    data,
    loading,
    error,
    updateData,
    refreshData
  };
}; 