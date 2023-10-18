import * as React from "react";
import { useSearchStore } from "./SearchStore";

export type Options = {
  fold_case: "true" | "false" | "auto";
  regex: boolean;
  context: boolean;
};

export const SearchOptions = () => {
  const options = useSearchStore((state) => state.options);
  const setOptions = useSearchStore((state) => state.setOptions);
  const onCaseChange = (e) => setOptions({ fold_case: e.target.value } as any);

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
};
