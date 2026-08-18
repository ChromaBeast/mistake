export interface SearchResult {
  id: string;
  type: "entity" | "order" | "invoice" | "mistake" | "document";
  title: string;
  subtitle: string;
  snippet?: string;
  financial_impact_minor?: number;
  status?: string;
  url: string;
  badge?: string;
}

export interface SearchFacet {
  field: string;
  label: string;
  count: number;
  selected?: boolean;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  results: SearchResult[];
  facets: Record<string, SearchFacet[]>;
}
