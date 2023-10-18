import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Options } from "./SearchOptions";
import {
  RepoInfo,
  SearchResponse,
  fetchRepoInfo,
  fetchSearchResults,
} from "./codesearch/api";

type State = {
  // use this value to see every user keystroke
  rawQuery: string;
  // use this value to see the query as it is fetched
  debouncedQuery: string;
  error?: string;
  options: Options;
  searchResponse?: SearchResponse;
  repoInfo?: RepoInfo;
};

type Actions = {
  setRawQuery: (query: string) => void;
  setDebouncedQuery: (debouncedQuery: string) => void;
  setOptions: (options: Options) => void;
  setError: (error: string | undefined) => void;
  fetchInitData: () => Promise<void>;
  fetchResults: () => Promise<void>;
};

const defaultQuery = "file:.go path";

export const useSearchStore = create(
  devtools(
    immer<State & Actions>((set, get) => ({
      rawQuery: defaultQuery,
      debouncedQuery: defaultQuery,
      error: undefined,
      options: {
        fold_case: "auto",
        regex: false,
        context: true,
      },

      setRawQuery: (q) => set({ rawQuery: q }),
      setDebouncedQuery: async (q) => {
        set({ debouncedQuery: q });
        await get().fetchResults();
      },
      fetchInitData: async () => {
        try {
          const repoInfo = await fetchRepoInfo();
          set({ repoInfo });
        } catch {
          // ignore: we might not have link configs, but that's ok
        }
      },
      fetchResults: async () => {
        const [results, error] = await fetchSearchResults({
          query: get().debouncedQuery,
          foldCase: get().options.fold_case,
          regex: get().options.regex,
        });
        if (error) {
          set({ error });
        } else if (results) {
          set({ searchResponse: results });
        }
      },
      setOptions: async (o) => {
        set({ options: o });
        await get().fetchResults();
      },
      setError: (error) => set({ error }),
    })),
    { name: "SearchStore" }
  )
);
