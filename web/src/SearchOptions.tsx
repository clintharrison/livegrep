import * as React from "react";

export type Options = {
  fold_case: "true" | "false" | "auto";
  regex: boolean;
  context: boolean;
};

export function SearchOptions({
  options,
  setOptions,
}: {
  options: Options;
  setOptions: (Options) => void;
}): React.JSX.Element {
  const onCaseChange = (e) => {
    setOptions({ ...options, fold_case: e.target.value });
  };

  return (
    <div className="search-options">
      {/* Case: [] match [] auto [] ignore */}
      <div className="search-option">
        <span className="label">Case:</span>
        <input
          type="radio"
          id="case-match"
          name="fold_case"
          tabIndex={3}
          value="false"
          checked={options.fold_case === "false"}
          onChange={onCaseChange}
        />
        <label htmlFor="case-match">match</label>
        <input
          type="radio"
          id="case-auto"
          name="fold_case"
          tabIndex={4}
          value="auto"
          checked={options.fold_case === "auto"}
          onChange={onCaseChange}
        />
        <label htmlFor="case-auto">auto</label>
        {" ["}
        <span className="tooltip-target">
          ?
          <div className="tooltip">
            Case-sensitive if the query contains capital letters
          </div>
        </span>
        {"]"}
        <input
          type="radio"
          id="case-ignore"
          name="fold_case"
          tabIndex={5}
          value="true"
          checked={options.fold_case === "true"}
          onChange={onCaseChange}
        />
        <label htmlFor="case-ignore">ignore</label>
      </div>
      {/* Regex: [] on */}
      <div className="search-option">
        <span className="label">Regex:</span>
        <input
          type="checkbox"
          id="regex"
          name="regex"
          tabIndex={6}
          checked={options.regex}
          onChange={(e) => {
            setOptions({ ...options, regex: e.target.checked });
          }}
        />
        <label htmlFor="regex">on</label>
      </div>
      {/* Context: [] on */}
      <div className="search-option">
        <span className="label">Context:</span>
        <input
          type="checkbox"
          id="context"
          name="context"
          tabIndex={8}
          checked={options.context}
          onChange={(e) => {
            setOptions({ ...options, context: e.target.checked });
          }}
        />
        <label htmlFor="context">on</label>
      </div>
    </div>
  );
}
