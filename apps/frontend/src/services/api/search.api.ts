import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface SearchResultMetal {
  id: string;
  name: string;
  code: string;
  category: string;
  status: string;
}

export interface SearchResultGrade {
  id: string;
  name: string;
  subGrade: string | null;
  metalId: string;
  status: string;
}

export interface SearchResultCalculation {
  id: string;
  name: string;
  batchId: string;
  mode: string;
  status: string;
  finalCost: string;
  createdAt: string;
}

export interface SearchResultReport {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export interface SearchResultUser {
  id: string;
  name: string;
  email: string;
  department: string | null;
  status: string;
}

export interface GlobalSearchResult {
  metals: SearchResultMetal[];
  grades: SearchResultGrade[];
  calculations: SearchResultCalculation[];
  reports: SearchResultReport[];
  users: SearchResultUser[];
}

export const searchApi = {
  globalSearch: async (q: string, limit = 10): Promise<GlobalSearchResult> => {
    const { data } = await apiClient.get<GlobalSearchResult>("/search", {
      params: { q, limit }
    });
    return data;
  }
};

export function useGlobalSearchQuery(q: string, enabled = true) {
  return useQuery({
    queryKey: ["global-search", q],
    queryFn: () => searchApi.globalSearch(q),
    enabled: enabled && q.trim().length > 0,
    staleTime: 10 * 1000 // 10 seconds short-live caching for fast input matching
  });
}
