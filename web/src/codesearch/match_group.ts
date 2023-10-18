// The livegrep API returns individual matches with potentially duplicate context lines.
// These need a bit of massaging to become non-duplicated sets.

import { Result } from "./api";

// This represents a single line which may or may not have a match.
export type FileGroupLine = {
  lno: number;
  line: string;
  bounds?: [number, number];
};

// Contiguous lines (which may have multiple matching lines) are grouped together.
export type FileGroupMatchChunk = {
  lines: FileGroupLine[];
};

function transformSingleMatch(
  result: Result,
  skipBefore = 0,
  skipAfter = 0
): FileGroupLine[] {
  let lines: FileGroupLine[] = [];

  // For some reason, these are stored in reverse order
  for (let i = result.context_before.length - 1; i >= skipBefore; i--) {
    lines.push({
      lno: result.lno - i - 1,
      line: result.context_before[i],
    });
  }

  lines.push({
    lno: result.lno,
    line: result.line,
    bounds: result.bounds,
  });

  for (let i = 0; i < result.context_after.length - skipAfter; i++) {
    lines.push({
      lno: result.lno + i + 1,
      line: result.context_after[i],
    });
  }

  return lines;
}

export function dedupeMatchGroup(fileResults: Result[]): FileGroupMatchChunk[] {
  if (fileResults.length === 0) {
    throw "invalid empty results given to dedupeMatchGroup";
  }

  const sortedResults = fileResults.slice().sort((r) => r.lno);

  const chunks: FileGroupMatchChunk[] = [];

  // array index is line number
  let acc: FileGroupLine[] = [];

  // This could be better: we're duplicating work when lots of lines exist in context,
  // and using a sparse array for `acc` is kind of weird.
  // But... it makes it easy to overwrite one result's context line with the
  // line that appears later as an actual match.
  // (In other words, so we set `bounds` properly)
  for (const result of sortedResults) {
    for (const line of transformSingleMatch(result)) {
      const lno = line.lno;

      // if we've accumulated some lines and we're going to add a far-away line,
      // end the current chunk and start a new one
      const lastLno = acc[acc.length - 1]?.lno;
      if (lastLno !== undefined && lno - lastLno > 1) {
        // Since we made a sparse array,
        chunks.push({ lines: Object.values(acc) });
        acc = [];
      }

      if (!Object.hasOwn(acc, lno)) {
        acc[lno] = line;
      } else if (line.bounds !== undefined) {
        acc[lno] = line;
      }
    }
  }

  // Handle the last set of lines
  chunks.push({ lines: Object.values(acc) });

  return chunks;
}
