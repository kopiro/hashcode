import { parseInput, Street, Intersection } from "./parser";
import { writeSolution } from "../helpers";

const NAME = process.env.NAME || "a";

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
        const t2 = 1;
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
  writeSolution("2021", NAME, solTxt.join("\n"));

  return sol;
}

function isGreenAt(time: number, sol: Solution[], street: Street) {
  const intersectionInSolution = sol.find((s) => s.id === street.end.id);
  const cycleTime = intersectionInSolution.config.reduce(
    (carry, e) => (carry += e.duration),
    0
  );
  const inmod = time % cycleTime;
  let x = 0;
  for (const streetInConfig of intersectionInSolution.config) {
    x += streetInConfig.duration;
    if (x > inmod) {
      return streetInConfig.street.id === street.id;
    }
  }
  return false;
}

async function calcScore() {
  let { params, streets, intersections, cars } = await parseInput(NAME);

  const sol = await solve();
  let stats = {
    score: 0,
    scoreForBonus: 0,
    scoreForEarly: 0,
    firstCar: null,
    lastCar: null,
  };

  for (let time = 0; time <= params.duration + 1; time++) {
    let afterCarsCycle = [];

    console.warn(
      `--------- T: ${time}, P: ${Math.ceil(
        (100 * time) / params.duration
      )}%, S: ${stats.score}, C: ${cars.length} -----------`
    );

    // Count the scores, considering that this would have happeneded in the previous tick
    cars = cars.filter((car) => {
      const isEndOfStreet = car.at.pos === car.at.street.len;
      const noStreetNext = car.streets.length === 1;
      if (isEndOfStreet && noStreetNext) {
        const se = params.duration - (time - 1);
        const sb = params.bonus;
        const s = se + sb;
        console.log(`[${time}] Car ${car.id} scored ${s}`);
        stats.score += s;
        stats.scoreForBonus += sb;
        stats.scoreForEarly += se;
        if (!stats.firstCar) {
          stats.firstCar = {
            car,
            score: s,
          };
        }
        stats.lastCar = {
          car,
          score: s,
        };
        return false;
      }
      return true;
    });

    if (time > params.duration) {
      console.log("End of game", stats, {
        carsReachedDest: params.carsCount - cars.length,
      });
      break;
    }

    cars.forEach((car) => {
      if (
        car.at.pos < car.at.street.len - (car.at.street.jam.length - 1) ||
        car.at.street.jam[0] === car
      ) {
        const newPos = Math.min(car.at.street.len, car.at.pos + 1);
        if (car.at.pos !== newPos) {
          car.at.pos = newPos;
          console.debug(
            `[${time}] Car ${car.id} has advanced through ${car.at.street.id} and it is at ${car.at.pos} / ${car.at.street.len}`
          );
        }
      } else {
        console.debug(
          `[${time}] Car ${car.id} can't advance to ${car.at.street.id}, it's at ${car.at.pos}`
        );
      }

      const isEndOfStreet = car.at.pos === car.at.street.len;
      if (isEndOfStreet) {
        console.log(
          `[${time}] Car ${car.id} has reached intersection ${car.at.street.end.id} (end of ${car.at.street.id})`
        );

        // If this car has ended his path, don't count it
        if (car.streets.length === 1) {
          console.log(`[${time}] Car ${car.id} has ended its path!`);
          //afterCarsCycle.push(() => {
          car.at.street.jam.shift();
          //});
          return;
        }

        // If the car is the end of street, it's waiting to go to the next
        const isGreen = isGreenAt(time, sol, car.at.street);
        console.log(
          `[${time}] Light at I=${car.at.street.end.id} from ${
            car.at.street.id
          } is ${isGreen ? "green" : "red"}`
        );

        if (isGreen) {
          //afterCarsCycle.push(() => {
          // Go to the next street
          const leavingStreet = car.streets.shift();
          car.at.street = car.streets[0];
          car.at.pos = 0;
          leavingStreet.jam.shift();
          if (!car.at.street.jam.includes(car)) {
            car.at.street.jam.push(car);
          }
          console.log(
            `[${time}] Car ${car.id} leaving ${leavingStreet.id} and entering next street ${car.at.street.id} (${car.at.street.jam.length} jam)`
          );
          //});
        }
      }
    });
  }
}

// console.debug = () => {};

calcScore();
