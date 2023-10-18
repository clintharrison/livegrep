export type Query = {
  query: string;
  foldCase: "auto" | "true" | "false";
  regex: boolean;
  repo?: string[];
};

export enum SearchType {
  Normal = "normal",
  FilenameOnly = "filename_only",
}

export type Stats = {
  re2_time: number;
  git_time: number;
  sort_time: number;
  index_time: number;
  analyze_time: number;
  total_time: number;
  why: "NONE" | "TIMEOUT" | "MATCH_LIMIT";
};

export type Result = {
  tree: string;
  version: string;
  path: string;
  line_number: number;
  context_before: string[];
  context_after: string[];
  bounds: [number, number];
  line: string;
};

export type FileResult = {
  tree: string;
  version: string;
  path: string;
  bounds: [number, number];
};

// ReplySearch is returned to /api/v1/search/:backend
export type ReplySearch = {
  info: Stats;
  results: Result[];
  file_results: FileResult[];
  search_type: SearchType;
};

export type SearchResponse = {
  clientElapsedMs: number;
  response: ReplySearch;
};

export async function fetchSearchResults(
  query: Query
): Promise<[SearchResponse?, string?]> {
  try {
    // TODO: support multiple backends?
    const start = Date.now();
    const body = new URLSearchParams();
    body.append("q", query.query);
    body.append("fold_case", query.foldCase);
    body.append("regex", query.regex.toString());
    if (query.repo) {
      query.repo.forEach((r) => body.append("repos", r));
    }
    const response = await fetch("/api/v1/search/", {
      method: "POST",
      body: body,
    });
    if (!response.ok) {
      return [undefined, `HTTP ${response.status}: ${response.statusText}`];
    }

    const json = await response.json();
    const elapsed = Date.now() - start;

    if (json.error?.message) {
      return [undefined, json.error.message];
    }

    const resp: SearchResponse = {
      clientElapsedMs: elapsed,
      response: json as ReplySearch,
    };
    return [resp, undefined];
  } catch (e) {
    return [undefined, e.message];
  }
}
