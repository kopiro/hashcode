import { Book, parseInput, parseSolution } from "./parser";

export async function calculateScore(name: string): Promise<number> {
  const solution = await parseSolution(name);
  const input = await parseInput(name);

  let TIME = 0;
  let booksScored: Set<Book> = new Set();

  solution.forEach((e) => {
    const lib = input.libsMap.get(e.id);
    const books = e.bookIds.map((id) => input.booksMap.get(id));
    TIME += lib.signupDays;
    if (TIME > input.numDays) {
      console.error("Solution is going into the future");
      return;
    }

    let timeForBooks = TIME;
    if (
      timeForBooks + Math.ceil(books.length / lib.booksPerDay) >
      input.numDays
    ) {
      console.error("Library is going in to the future");
    }

    while (books.length > 0 && timeForBooks < input.numDays) {
      const booksToTake = books.splice(0, lib.booksPerDay);
      booksToTake.forEach((book) => {
        if (booksScored.has(book)) {
          console.error("Adding twice same book");
        }
        booksScored.add(book);
      });
      timeForBooks += 1;
    }
  });

  let score = 0;
  for (const book of booksScored) {
    score += book.score;
  }
  return score;
}

(async () => {
  const score = await calculateScore("z_lukas");
  console.log("score", score);
})();
