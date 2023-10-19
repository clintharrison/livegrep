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
  lno: number;
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

export function fileId(result: Result): string {
  return result.tree + ":" + result.version + ":" + result.path;
}

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

export type InternalViewRepo = {
  path: string;
  name: string;
  revisions: string[];
  metadata: {
    url_pattern?: string;
    remote?: string;
    github?: string;
    labels?: string[];
  };
};

export type LinkConfig = {
  label: string;
  url_template: string;
  whitelist_pattern: RegExp;
  target: string;
};

export type RepoInfo = {
  repo_urls: {
    [key: string]: {
      [key: string]: string;
    };
  };
  internal_view_repos: {
    [key: string]: InternalViewRepo;
  };
  default_search_repos: string[];
  link_configs: LinkConfig[];
};

export async function fetchRepoInfo(): Promise<RepoInfo> {
  const response = await fetch("/api/v1/repos");
  const json = (await response.json()) as RepoInfo;
  json.link_configs.forEach((lc) => {
    lc.whitelist_pattern = new RegExp(lc.whitelist_pattern);
  });
  return json as RepoInfo;
}
