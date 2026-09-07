export const TOWN_PEOPLE = [
  {
    id: "mina",
    name: "Mina",
    job: "baker",
    line: "Warm rolls this morning!",
    path: [
      { x: 420, y: 980 },
      { x: 780, y: 980 },
      { x: 1120, y: 1320 },
    ],
    skin: "honey",
    hair: "auburn",
    top: "#f4f1ea",
  },
  {
    id: "theo",
    name: "Theo",
    job: "librarian",
    line: "Quiet voices in the stacks.",
    path: [
      { x: 420, y: 1364 },
      { x: 700, y: 1364 },
      { x: 980, y: 1180 },
    ],
    skin: "peach",
    hair: "black",
    top: "#6b4f8a",
  },
  {
    id: "pip",
    name: "Pip",
    job: "park",
    line: "The ducks already ate.",
    path: [
      { x: 1080, y: 1880 },
      { x: 1320, y: 2020 },
      { x: 920, y: 2080 },
    ],
    skin: "amber",
    hair: "copper",
    top: "#3f9b4a",
  },
  {
    id: "nia",
    name: "Nia",
    job: "market",
    line: "Peaches from the sunny side.",
    path: [
      { x: 1380, y: 1040 },
      { x: 1480, y: 1100 },
      { x: 1300, y: 1040 },
    ],
    skin: "cocoa",
    hair: "night",
    top: "#e67e22",
  },
  {
    id: "otto",
    name: "Otto",
    job: "cafe",
    line: "Cocoa is ready if you sit.",
    path: [
      { x: 1980, y: 1320 },
      { x: 1720, y: 1320 },
      { x: 1540, y: 1180 },
    ],
    skin: "espresso",
    hair: "brown",
    top: "#c0392b",
  },
  {
    id: "bee",
    name: "Bee",
    job: "walker",
    line: "I like the banners today.",
    path: [
      { x: 980, y: 900 },
      { x: 1720, y: 900 },
      { x: 1806, y: 1280 },
      { x: 1720, y: 1520 },
      { x: 980, y: 1520 },
    ],
    skin: "porcelain",
    hair: "blonde",
    top: "#5b8def",
  },
  {
    id: "willow",
    name: "Willow",
    job: "walker",
    line: "Sunny stones feel nice on toes.",
    path: [
      { x: 1260, y: 1496 },
      { x: 1500, y: 1496 },
      { x: 1400, y: 1488 },
    ],
    skin: "peach",
    hair: "copper",
    top: "#7dcea0",
  },
];

export const LISTEN_REACH = 140;

export function createPeople() {
  return TOWN_PEOPLE.map((person, index) => ({
    ...person,
    x: person.path[0].x,
    y: person.path[0].y,
    waypoint: 1 % person.path.length,
    waitMs: index * 400,
    bubbleMs: 0,
  }));
}

export function stepPeople(people, dt) {
  return people.map((person) => {
    const waitMs = person.waitMs - dt;
    const bubbleMs = Math.max(0, person.bubbleMs - dt);
    if (waitMs > 0) {
      return { ...person, waitMs, bubbleMs };
    }
    const point = person.path[person.waypoint];
    const dx = point.x - person.x;
    const dy = point.y - person.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 8) {
      return {
        ...person,
        x: point.x,
        y: point.y,
        waypoint: (person.waypoint + 1) % person.path.length,
        waitMs: 1600,
        bubbleMs: person.waypoint % 2 === 0 ? 2200 : bubbleMs,
      };
    }
    const step = Math.min(dist, 54 * (dt / 1000));
    return {
      ...person,
      x: person.x + (dx / dist) * step,
      y: person.y + (dy / dist) * step,
      waitMs: 0,
      bubbleMs,
    };
  });
}

export function listenTo(people, id) {
  return people.map((person) => (person.id === id ? { ...person, bubbleMs: 2200 } : person));
}

export function nearbyPerson(people, x, y, reach = LISTEN_REACH) {
  return people.find((person) => Math.hypot(person.x - x, person.y - y) <= reach) ?? null;
}
