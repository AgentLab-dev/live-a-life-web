export const JOBS = [
  { id: "none", name: "Just me", workplace: null, action: null, look: null },
  { id: "baker", name: "Baker", workplace: "bakery", action: "knead", look: "apron" },
  { id: "librarian", name: "Librarian", workplace: "library", action: "stamp", look: "cardigan" },
  { id: "park", name: "Park helper", workplace: "town", action: "water", look: "vest" },
];

export const DEFAULT_JOB = "none";

export function jobLook(id) {
  return JOBS.find((item) => item.id === id) ?? JOBS[0];
}

export function setJob(state, id) {
  const next = JOBS.find((item) => item.id === id);
  if (!next) return state;
  const copy = { ...state, job: next.id };
  delete copy.money;
  delete copy.coins;
  delete copy.pay;
  return copy;
}

export function canWorkHere(state) {
  const job = jobLook(state.job);
  if (!job.action) return false;
  return job.id === "park" ? state.room === "town" : state.room === job.workplace;
}

export function startWork(state) {
  if (!canWorkHere(state)) return state;
  const next = { ...state, pose: "work", actionBeatMs: 1100 };
  delete next.money;
  delete next.coins;
  delete next.pay;
  delete next.score;
  return next;
}
