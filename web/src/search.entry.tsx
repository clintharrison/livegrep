import * as React from "react";
import { useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { SearchInput } from "./SearchInput";
import { SearchOptions } from "./SearchOptions";
import { useSearchStore } from "./SearchStore";
import { SearchType } from "./codesearch/api";

const DEBOUNCE_TIME_MS = 1000;

const ResultStats = () => {
  const searchType = useSearchStore(
    (state) => state.searchResponse?.response?.search_type
  );
  const elapsed = useSearchStore(
    (state) => state.searchResponse?.clientElapsedMs
  );
  const numFileResults = useSearchStore(
    (state) => state.searchResponse?.response?.file_results.length
  );
  const numSearchResults = useSearchStore(
    (state) => state.searchResponse?.response?.results.length
  );
  const why = useSearchStore(
    (state) => state.searchResponse?.response?.info?.why
  );

  return (
    <div id="countarea">
      <span id="numresults">
        {searchType === SearchType.FilenameOnly
          ? numFileResults
          : numSearchResults}
        {why !== "NONE" ? "+" : ""} matches found
        {elapsed ? (
          <span id="searchtimebox">
            <span className="label"> / </span>
            <span id="searchtime">{elapsed / 1000}s</span>
          </span>
        ) : null}
      </span>
    </div>
  );
};

const FileExtensions = () => {
  // TODO: implement the Narrow to: buttons
  return null;
};

const PathResults = () => {
  const fileResults = useSearchStore(
    (state) => state.searchResponse?.response?.file_results
  );
  if (!fileResults) return;

  return fileResults.map((fr) => {
    return (
      <p key={`${fr.tree}:${fr.version}:${fr.path}`}>
        {fr.tree}:{fr.version}:{fr.path}
      </p>
    );
  });
};

const GroupedResults = () => {
  return null;
};

const SearchResults = () => {
  return (
    <div id="resultbox">
      <ResultStats />
      <div id="results">
        <FileExtensions />
        <PathResults />
        <GroupedResults />
      </div>
    </div>
  );
};

const SearchPage = () => {
  // Fetch on first load
  useEffect(() => {
    useSearchStore.getState().fetchResults();
  }, []);

  // Debounce query changes by observing outside of React state.
  // This ensures we only fetch results after the user has stopped typing.
  useEffect(() => {
    let timer: number;

    const unsubscribe = useSearchStore.subscribe((state, prevState) => {
      // Only debounce changes to the raw query.
      if (state.rawQuery === prevState.rawQuery) return;

      clearTimeout(timer);
      timer = setTimeout(async () => {
        state.setDebouncedQuery(state.rawQuery);
      }, DEBOUNCE_TIME_MS);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <div id="searcharea">
        <SearchInput />
        <SearchOptions />
      </div>
      <SearchResults />
    </>
  );
};

const App = () => <SearchPage />;

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error("No root element found");
}
