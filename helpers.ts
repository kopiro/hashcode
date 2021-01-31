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

export async function writeSolution(name: string, data) {
  return fs.promises.writeFile(
    path.join(YEAR, "output", `${name}.txt`),
    data.join("\n")
  );
}
