import fs from "fs";
import path from "path";

export async function readInput(year: string, name: string) {
  const content = await fs.promises.readFile(
    path.join(year, "input", `${name}.txt`),
    "utf8"
  );
  return content.split("\n");
}

export async function readSolution(year: string, name: string) {
  const content = await fs.promises.readFile(
    path.join(year, "output", `${name}.txt`),
    "utf8"
  );
  return content.split("\n");
}

export async function writeSolution(year: string, name: string, data: string) {
  return fs.promises.writeFile(path.join(year, "output", `${name}.txt`), data);
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
