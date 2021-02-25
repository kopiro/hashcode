import { Book, Lib, parseInput } from "./parser";
import { permutations, writeSolution } from "../helpers";

type LibGenetic = Lib & {
  orderedBooks: Book[];
  takenBooks: Book[];
};

async function solve(name: string) {
  const input = await parseInput(name);
  const POPULATION_SIZE = 10;

  const libs: Map<number, LibGenetic> = new Map();

  for (const lib of input.libsMap.values()) {
    const libGenetic = lib as LibGenetic;
    libGenetic.orderedBooks = lib.books.sort((a, b) => b.score - a.score);
    libs.set(libGenetic.id, libGenetic);
  }

  let sols = [];

  const libIds = Array.from(libs.values()).map((lib) => lib.id);
  let i = 0;
  for (const libComb of permutations(libIds)) {
    if (i++ > POPULATION_SIZE) {
      break;
    }

    const sol: {
      score: number;
      time: number;
      lib: LibGenetic[];
      takenBooks: Set<Book>;
    } = {
      score: 0,
      time: 0,
      lib: [],
      takenBooks: new Set(),
    };
    for (let libId of libComb) {
      const lib = { ...libs.get(libId) };
      lib.orderedBooks = [...lib.orderedBooks];
      lib.takenBooks = [];

      sol.time += lib.signupDays;
      if (sol.time > input.numDays) {
        break;
      }

      // Take all fucking books in score order
      let time_library = sol.time;
      let books_processed_per_day = 0;
      for (const book of lib.orderedBooks) {
        if (time_library > input.numDays) {
          break;
        }
        if (!sol.takenBooks.has(book)) {
          sol.takenBooks.add(book);
          lib.takenBooks.push(book);
          sol.score += book.score;
          books_processed_per_day++;
          if (books_processed_per_day === lib.booksPerDay) {
            books_processed_per_day = 0;
            time_library++;
          }
        }
      }
      sol.lib.push(lib);
    }
    sols.push(sol);
    console.log("sol", sol, libComb);
    writeSolution(
      `z_lukas_${libComb.join(",")}`,
      [
        sol.lib.length,
        sol.lib
          .map((lib) => {
            return [
              [lib.id, lib.takenBooks.length].join(" "),
              lib.takenBooks.map((book) => book.id).join(" "),
            ].join("\n");
          })
          .join("\n"),
      ].join("\n")
    );
  }
}

solve("z_lukas");
