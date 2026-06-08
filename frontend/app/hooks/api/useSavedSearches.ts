import { useState, useEffect, useCallback } from 'react';
import { savedSearchService } from '~/services/api/savedSearchService';
import type { SavedSearch } from '~/services/api/savedSearchService';

export function useSavedSearches() {
  const [data, setData] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const refetch = useCallback(() => {
    setIsLoading(true);
    setIsError(false);
    savedSearchService
      .list()
      .then((searches) => {
        setData(searches || []);
      })
      .catch(() => {
        setIsError(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const deleteSearch = useCallback(async (id: string) => {
    await savedSearchService.delete(id);
    setData((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const toggleAlerts = useCallback(async (id: string, enabled: boolean) => {
    await savedSearchService.toggleAlerts(id, enabled);
    setData((prev) =>
      prev.map((s) => (s.id === id ? { ...s, alertEnabled: enabled } : s))
    );
  }, []);

  return { data, isLoading, isError, refetch, deleteSearch, toggleAlerts };
}
