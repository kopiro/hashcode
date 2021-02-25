import { readInput, readSolution } from "../helpers";

export async function parseSolution(name: string) {
  const data = await readSolution(name);
}

export async function parseInput(name: string) {
  const data = await readInput(name);
}
