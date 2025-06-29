import { createContext, useCallback } from 'react';
import { invalidateCache, clearAllCache } from '../hooks/useDataManager';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const invalidateTeamCache = useCallback(() => {
    invalidateCache('/teams');
    invalidateCache('/statistics');
    invalidateCache('/statistics/completed-teams');
    invalidateCache('/statistics/incomplete-teams');
  }, []);

  const invalidateStudentCache = useCallback(() => {
    invalidateCache('/students');
    invalidateCache('/statistics');
  }, []);

  const invalidateDepartmentCache = useCallback(() => {
    invalidateCache('/departments');
    invalidateCache('/departments/team-counts');
    invalidateCache('/statistics');
  }, []);

  const invalidateInterviewCache = useCallback(() => {
    invalidateCache('/interviews/stats/overview');
    // Invalidate specific interview caches
    const keys = Array.from(localStorage.keys()).filter(key => 
      key.startsWith('/interviews/student/') || 
      key.startsWith('/interviews/team/') ||
      key.startsWith('/interviews/department/')
    );
    keys.forEach(key => invalidateCache(key));
  }, []);

  const invalidateAllCache = useCallback(() => {
    clearAllCache();
  }, []);

  const value = {
    invalidateTeamCache,
    invalidateStudentCache,
    invalidateDepartmentCache,
    invalidateInterviewCache,
    invalidateAllCache,
    invalidateCache
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export { DataContext }; 