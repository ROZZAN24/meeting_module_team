import { useState, useEffect, useCallback } from 'react';
import axios from 'utils/axios';
import { API_PATHS } from 'utils/api-constants';

/**
 * useLookups Hook
 * Standardized way to fetch master data (Departments, Designations, etc.)
 * Usage: const { departments, designations, loading } = useLookups(['DEPARTMENTS', 'DESIGNATIONS']);
 */
export const useLookups = (lookupTypes = []) => {
  const [lookups, setLookups] = useState({
    loading: true,
    error: null
  });

  const fetchLookups = useCallback(async () => {
    setLookups(prev => ({ ...prev, loading: true }));
    const results = {};
    
    try {
      await Promise.all(
        lookupTypes.map(async (type) => {
          // Find path in API_PATHS (searching HRM and QMS groups)
          const path = API_PATHS.HRM[type] || API_PATHS.QMS[type];
          
          if (!path) {
            console.warn(`Lookup type "${type}" not found in API_PATHS`);
            return;
          }

          const response = await axios.get(path);
          // Store as camelCase (e.g., DEPARTMENTS -> departments)
          const key = type.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          results[key] = response.data || [];
        })
      );
      
      setLookups({
        ...results,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Failed to fetch lookups:', err);
      setLookups(prev => ({ ...prev, loading: false, error: err }));
    }
  }, [JSON.stringify(lookupTypes)]);

  useEffect(() => {
    if (lookupTypes.length > 0) {
      fetchLookups();
    } else {
      setLookups(prev => ({ ...prev, loading: false }));
    }
  }, [fetchLookups]);

  return lookups;
};

export default useLookups;
