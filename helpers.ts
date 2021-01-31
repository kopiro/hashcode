import fs from "fs";
import path from "path";

const YEAR = "2020"; //(process.env.YEAR || new Date().getUTCFullYear()).toString();

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
 * @param {Array} elements The combination
 */
export function* permutations(elements, map = new Map()) {
  if (elements.length === 1) {
    yield elements;
  } else {
    const [first, ...rest] = elements;
    for (const perm of permutations(rest, map)) {
      for (let i = 0; i < elements.length; i++) {
        const start = perm.slice(0, i);
        const rest = perm.slice(i);
        const val = [...start, first, ...rest];
        // const key = JSON.stringify(val);
        // Use join since we know that inner elements are primites
        const key = val.join(",");
        if (!map.has(key)) {
          map.set(key, val);
          yield val;
        }
      }
    }
  }
}
