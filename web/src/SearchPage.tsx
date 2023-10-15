import * as React from "react";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { SearchInput } from "./SearchInput";
import { Options, SearchOptions } from "./SearchOptions";

const DEBOUNCE_TIME_MS = 1000;

const useDebouncedState = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  useEffect(() => {
    console.log("change detected: debouncing...");
    const timer = setTimeout(() => {
      console.log("and setting it!");
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value]);
  return debouncedValue;
};

const SearchPage = () => {
  const [query, setQuery] = useState("file:\\.go$ path to an index");
  const debouncedQuery = useDebouncedState(query, DEBOUNCE_TIME_MS);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<Options>({
    fold_case: "auto",
    regex: false,
    context: true,
  });

  return (
    <>
      <div id="searcharea">
        <SearchInput query={query} error={error} onQueryChange={setQuery} />
        <SearchOptions options={options} setOptions={setOptions} />
      </div>
      <div id="resultbox">Result box for query {query}</div>
      <div id="resultbox">(debounced)</div>
      <div id="resultbox">Result box for query {debouncedQuery}</div>
    </>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<SearchPage />);
} else {
  console.error("No root element found");
}
