import * as React from "react";
import { useSearchStore } from "./SearchStore";

export const SearchInput = () => {
  const query = useSearchStore((state) => state.rawQuery);
  const setQuery = useSearchStore((state) => state.setRawQuery);
  const error = useSearchStore((state) => state.error);

  return (
    <div className="search-inputs">
      <div className="prefixed-input">
        <label htmlFor="searchbox" className="prefix-label">
          Query:
        </label>
        <input
          type="text"
          id="searchbox"
          tabIndex={1}
          required={true}
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        />
      </div>
      <div id="regex-error" className={error ? "show" : undefined}>
        <span id="errortext">{error}</span>
      </div>
      <div className="query-hint">
        Special terms: <code>path:</code> <code>-path:</code> <code>repo:</code>{" "}
        <code>-repo:</code> <code>max_matches:</code>
      </div>
    </div>
  );
};
