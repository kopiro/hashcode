import { parseInput, Street, Intersection } from "./parser";
import { writeSolution } from "../helpers";

const NAME = process.env.NAME;

type SolConfig = {
  street: Street;
  duration: number;
};

type Solution = {
  id: number;
  config: SolConfig[];
};

async function solve() {
  const { params, streets, intersections, cars } = await parseInput(NAME);
  let sol: Solution[] = [];

  // ALWAYS GREEN BECAUSE FUCKING STRAIGHT STREETS
  for (let int of Object.values(intersections)) {
    if (int.entering.length === 1) {
      sol.push({
        id: int.id,
        config: [{ street: int.entering[0], duration: 1 }],
      });
    }
  }

  const streetsCrossedTimes: Record<string, number> = {};
  for (const car of cars) {
    if (car.streetsTotalLen < params.duration / 2) {
      continue;
    }
    car.streets.forEach((street) => {
      streetsCrossedTimes[street.id] = streetsCrossedTimes[street.id] || 0;
      streetsCrossedTimes[street.id]++;
    });
  }

  for (let int of Object.values(intersections)) {
    let solInt: Solution[] = [];
    if (int.entering.length > 1) {
      const actualEntering = int.entering.filter(
        (int) => streetsCrossedTimes[int.id] > 0
      );

      if (actualEntering.length === 0) {
        continue;
      }

      let sum = 0;
      let min = +Infinity;
      actualEntering.forEach((intEnt) => {
        const t = streetsCrossedTimes[intEnt.id];
        sum += t;
        if (t < min) {
          min = t;
        }
      });

      const solConfig: SolConfig[] = [];

      actualEntering.forEach((intEnt) => {
        const t = streetsCrossedTimes[intEnt.id];
        const t2 = Math.ceil(Math.exp(Math.floor(t / min)));
        solConfig.push({ street: intEnt, duration: t2 });
      });

      solInt.push({
        id: int.id,
        config: solConfig,
      });

      sol = [...sol, ...solInt];
    }
  }

  const solTxt: string[] = [`${sol.length}`];
  sol.forEach((s) => {
    solTxt.push(`${s.id}`);
    solTxt.push(`${s.config.length}`);
    s.config.forEach((c) => {
      solTxt.push(`${c.street.id} ${c.duration}`);
    });
  });

  writeSolution(NAME, solTxt.join("\n"));

  return sol;
}

function isGreenAt(
  time: number,
  sol: Solution[],
  int: Intersection,
  enteringInIntStreet: Street
) {
  const intInSol = sol.find((s) => s.id === int.id);
  const cycleTime = intInSol.config.reduce(
    (carry, e) => (carry += e.duration),
    0
  );
  const inmod = time % cycleTime;
  let x = 0;
  let xs: SolConfig = null;
  for (const s of intInSol.config) {
    x += s.duration;
    if (x >= inmod) {
      xs = s;
      break;
    }
  }
  return xs.street.id === enteringInIntStreet.id;
}

async function score() {
  const { params, streets, intersections, cars } = await parseInput(NAME);

  const sol = await solve();

  cars.forEach((car) => {
    car.streets.shift();
  });

  for (let time = 0; time < params.duration; time++) {
    cars.forEach((car) => {
      const street = car.at.street;
      const isAtSem = car.at.pos === street.len;
      if (isAtSem) {
        const isGreen = isGreenAt(
          time,
          sol,
          intersections[car.at.street.end],
          street
        );
        if (isGreen) {
          car.at.street = car.streets.shift();
          car.at.pos = 0;
        }
      } else {
        car.at.pos++;
      }
    });
  }
}

solve();
