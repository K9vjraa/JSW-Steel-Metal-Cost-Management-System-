import { useEffect, useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export interface TableQueryState<TFilters extends Record<string, string | undefined> = Record<string, string | undefined>> {
  page: number;
  limit: number;
  search: string;
  sortBy?: string;
  sortDir?: SortDir;
  filters: TFilters;
}

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

export function useTableQuery<TFilters extends Record<string, string | undefined> = Record<string, string | undefined>>(
  initial?: Partial<TableQueryState<TFilters>>
) {
  const [query, setQuery] = useState<TableQueryState<TFilters>>({
    page: initial?.page ?? 1,
    limit: initial?.limit ?? 25,
    search: initial?.search ?? "",
    sortBy: initial?.sortBy,
    sortDir: initial?.sortDir,
    filters: (initial?.filters ?? {}) as TFilters
  });

  const debouncedSearch = useDebouncedValue(query.search, 300);

  const params = useMemo(() => {
    return serializeTableParams({
      ...query,
      search: debouncedSearch,
      filters: query.filters
    });
  }, [query, debouncedSearch]);

  return { query, setQuery, params, queryKey: stableTableKey(params) };
}

export function serializeTableParams(query: TableQueryState) {
  const params: Record<string, string | number | undefined> = {
    page: query.page,
    limit: query.limit,
    search: query.search.trim() || undefined,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
    ...query.filters
  };

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
  );
}

export function stableTableKey(params: Record<string, unknown>) {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}:${String(params[key])}`)
    .join("|");
}
