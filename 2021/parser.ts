import { readInput, readSolution } from "../helpers";

export type Params = {
  duration: number;
  bonus: number;
  intersectionsCount: number;
  streetsCount: number;
  carsCount: number;
};

export type Car = {
  id: number;
  streets: Street[];
  streetsTotalLen: number;
  at: {
    street: Street;
    pos: number;
  };
};

export type Street = {
  id: string;
  len: number;
  start: Intersection;
  end: Intersection;
  jam: Car[];
};

export type Intersection = {
  id: number;
  entering: Street[];
  leaving: Street[];
};

export async function parseSolution(name: string) {
  const data = await readSolution("2021", name);
}

export async function parseInput(name: string) {
  const data = await readInput("2021", name);
  const [
    duration,
    intersectionsCount,
    streetsCount,
    carsCount,
    bonus,
  ] = data.shift().split(" ");
  const params: Params = {
    duration: Number(duration),
    intersectionsCount: Number(intersectionsCount),
    streetsCount: Number(streetsCount),
    carsCount: Number(carsCount),
    bonus: Number(bonus),
  };

  const streets: Record<string, Street> = {};
  const cars: Car[] = [];
  const intersections: Record<number, Intersection> = {};

  for (let i = 0; i < Number(streetsCount); i++) {
    const [start, end, id, len] = data.shift().split(" ");

    intersections[start] = intersections[start] || {
      id: start,
      entering: [],
      leaving: [],
    };
    intersections[end] = intersections[end] || {
      id: end,
      entering: [],
      leaving: [],
    };

    const street: Street = {
      id,
      start: intersections[start],
      end: intersections[end],
      len: Number(len),
      jam: [],
    };

    intersections[start].leaving.push(street);
    intersections[end].entering.push(street);
    streets[street.id] = street;
  }
  for (let i = 0; i < Number(carsCount); i++) {
    const carStreets = data
      .shift()
      .split(" ")
      .map((id) => streets[id]);

    const carStreetsCount = Number(carStreets.shift());
    const streetsTotalLen = carStreets
      .slice(1)
      .reduce((sum, street) => (sum += street.len), 0);
    const car: Car = {
      id: i,
      streets: carStreets,
      streetsTotalLen,
      at: {
        street: carStreets[0],
        pos: carStreets[0].len - carStreets[0].jam.length,
      },
    };
    car.at.street.jam.push(car);
    cars[car.id] = car;
  }

  return { params, streets, cars, intersections };
}
