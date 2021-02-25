import fs from "fs";
import path from "path";

const YEAR = (process.env.YEAR || new Date().getUTCFullYear()).toString();

export async function readInput(name: string) {
  const content = await fs.promises.readFile(
    path.join(YEAR, "input", `${name}.txt`),
    "utf8"
  );
  return content.split("\n");
}

export async function readSolution(name: string) {
  const content = await fs.promises.readFile(
    path.join(YEAR, "output", `${name}.txt`),
    "utf8"
  );
  return content.split("\n");
}

export async function writeSolution(name: string, data: string) {
  return fs.promises.writeFile(path.join(YEAR, "output", `${name}.txt`), data);
}

/**
 * Generate all possibile unique permutation of a given set
 */
export function* permutations<T>(
  elements: T[],
  map: Map<string, T> = new Map(),
  serializer = (val: T[]) => JSON.stringify(val)
) {
  if (elements.length === 1) {
    yield elements;
  } else {
    const [first, ...rest] = elements;
    for (const perm of permutations(rest, map, serializer)) {
      for (let i = 0; i < elements.length; i++) {
        const start = perm.slice(0, i);
        const rest = perm.slice(i);
        const val = [...start, first, ...rest];
        const key = serializer(val);
        if (!map.has(key)) {
          map.set(key, val);
          yield val;
        }
      }
    }
  }
}
