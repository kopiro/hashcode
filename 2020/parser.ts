import { readInput, readSolution } from "../helpers";

export type Book = {
  id: number;
  score: number;
};

export type Lib = {
  id: number;
  numBooks: number;
  signupDays: number;
  booksPerDay: number;
  books: Book[];
};

export type LibSolution = {
  id: number;
  numBooks: number;
  bookIds: number[];
};

export async function parseSolution(name: string) {
  const data = await readSolution(name);
  const numLibs = Number(data.shift());
  const libs: LibSolution[] = [];
  for (let i = 0; i < numLibs; i++) {
    const [id, numBooks] = data.shift().split(" ").map(Number);
    const bookIds = data.shift().split(" ").map(Number);
    libs.push({
      id,
      numBooks,
      bookIds,
    } as LibSolution);
  }
  return libs;
}

export async function parseInput(name: string) {
  const data = await readInput(name);

  const libsMap: Map<number, Lib> = new Map();
  const booksMap: Map<number, Book> = new Map();

  const [, numLibs, numDays] = data.shift().split(" ").map(Number);
  data
    .shift()
    .split(" ")
    .forEach((score, id) => {
      const book = { id: Number(id), score: Number(score) };
      booksMap.set(book.id, book);
    });

  for (let i = 0; i < numLibs; i++) {
    const [numBooks, signupDays, booksPerDay] = data
      .shift()
      .split(" ")
      .map(Number);
    const books: Book[] = data
      .shift()
      .split(" ")
      .map((id) => booksMap.get(Number(id)));
    const lib: Lib = {
      id: i,
      books,
      numBooks,
      signupDays,
      booksPerDay,
    };
    libsMap.set(lib.id, lib);
  }

  return { numDays, libsMap, booksMap };
}
