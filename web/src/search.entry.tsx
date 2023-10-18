import * as React from "react";
import { useEffect, StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { SearchInput } from "./SearchInput";
import { SearchOptions } from "./SearchOptions";
import { useSearchStore } from "./SearchStore";
import { Result, SearchType, fileId } from "./codesearch/api";
import { dedupeMatchGroup } from "./codesearch/match_group";

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
  const searchType = useSearchStore(
    (state) => state.searchResponse?.response?.search_type
  );
  if (!fileResults) return;
  if (searchType !== SearchType.FilenameOnly || fileResults.length > 10) return;

  return fileResults.map((fr) => {
    return (
      <p key={`${fr.tree}:${fr.version}:${fr.path}`}>
        {fr.tree}:{fr.version}:{fr.path}
      </p>
    );
  });
};

// TODO: lno
const internalViewForResult: (res: Result, lno?: number) => string = (
  res,
  lno
) => {
  const repo = res.tree;
  const version = res.version;
  const path = res.path;
  return `/view/${repo}/${version}/${path}`;
};

const externalLinkForResult: (
  url_template: string,
  res: Result,
  lno?: number
) => string = (url_template, res, lno) => {
  const repo = res.tree;
  const version = res.version;
  const path = res.path;
  let url = url_template.replace("{path}", path);
  url = url.replace("{name}", repo);
  url = url.replace("{version}", version);
  if (lno) {
    url = url.replace("{lno}", lno.toString());
  } else if (url.endsWith("#L{lno}")) {
    url = url.replace("#L{lno}", "");
  } else {
    url = url.replace("{lno}", "1");
  }
  return url;
};

const FileGroup = ({ id, results }: { id: string; results: Result[] }) => {
  const repo = results[0].tree;
  const version = results[0].version;
  const path = results[0].path;
  const linkConfigs = useSearchStore
    .getState()
    .repoInfo?.link_configs?.filter((config) => {
      return !config.whitelist_pattern || config.whitelist_pattern.test(id);
    });

  const matchGroupChunks = dedupeMatchGroup(results);
  return (
    <div className="file-group">
      <div className="header">
        <span className="header-path">
          <a href={internalViewForResult(results[0])} className="result-path">
            <span className="repo">{repo}:</span>
            <span className="version">{version}:</span>
            <span className="filename">{path}</span>
          </a>
        </span>
        {linkConfigs?.map((config) => {
          const template = config.url_template;
          return (
            <span key={`${id}:${template}`} className="header-link">
              <a
                href={externalLinkForResult(template, results[0])}
                className="file-action-link"
              >
                {config.label}
              </a>
            </span>
          );
        })}
      </div>
      {matchGroupChunks.map((chunk) => (
        <div key={id + chunk.lines[0].lno} className="match">
          <div className="contents">
            {chunk.lines.map((line) => {
              const key = line.bounds ? `M${line.lno}` : line.lno.toString();
              let lineContent: React.ReactNode = line.line;
              if (line.bounds) {
                // TODO: support more than one match
                const bounds = line.bounds;
                lineContent = (
                  <>
                    {line.line.slice(0, bounds[0])}
                    <span className="matchstr">
                      {line.line.slice(bounds[0], bounds[1])}
                    </span>
                    {line.line.slice(bounds[1])}
                  </>
                );
              }
              return (
                <React.Fragment key={key}>
                  <a
                    href={internalViewForResult(results[0], line.lno)}
                    className="lno-link"
                  >
                    <span
                      className="lno"
                      aria-label={line.bounds ? `${line.lno}:` : `${line.lno}-`}
                    ></span>
                  </a>
                  <span>{lineContent}</span>
                  <span></span>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const GroupedResults = () => {
  const results = useSearchStore(
    (state) => state.searchResponse?.response?.results
  );
  if (!results) return;

  // Group the results by filename
  const fileGroups: { [key: string]: Result[] } = {};
  for (const result of results) {
    const id = fileId(result);
    if (fileGroups.hasOwnProperty(id)) {
      fileGroups[id].push(result);
    } else {
      fileGroups[id] = [result];
    }
  }

  return Object.keys(fileGroups).map((id) => {
    const results = fileGroups[id];
    return <FileGroup key={id} id={id} results={results} />;
  });
};

const SearchResults = () => {
  const resultLen = useSearchStore(
    (state) => state.searchResponse?.response?.results.length
  );
  return (
    <div id="resultbox">
      {resultLen ? (
        <div id="resultarea" className="show">
          <ResultStats />
          <div id="results">
            <FileExtensions />
            <PathResults />
            <GroupedResults />
          </div>
        </div>
      ) : (
        <div id="helparea"></div>
      )}
    </div>
  );
};

const SearchPage = () => {
  // Fetch on first load
  useEffect(() => {
    useSearchStore.getState().fetchInitData();
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
