import * as React from "react";

type Props = {
  query: string;
  error: string | null;
  onQueryChange: (string) => void;
};

export function SearchInput({
  query,
  error,
  onQueryChange,
}: Props): React.JSX.Element {
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
          onInput={(e) => onQueryChange((e.target as HTMLInputElement).value)}
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
}
