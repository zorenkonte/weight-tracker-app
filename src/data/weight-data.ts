export interface WeightEntry {
  date: string;
  weight: number | null;
}

export interface Person {
  name: string;
  data: WeightEntry[];
}

export const DATES = [
  "1/16/2026",
  "1/30/2026",
  "2/25/2026",
  "3/10/2026",
  "3/31/2026",
];

export const weightData: Person[] = [
  {
    name: "LAINE",
    data: [
      { date: "1/16/2026", weight: 59 },
      { date: "1/30/2026", weight: 59.8 },
      { date: "2/25/2026", weight: 60 },
      { date: "3/10/2026", weight: null },
      { date: "3/31/2026", weight: 61.5 },
    ],
  },
  {
    name: "AIKA",
    data: [
      { date: "1/16/2026", weight: 75.9 },
      { date: "1/30/2026", weight: 75.9 },
      { date: "2/25/2026", weight: 75.6 },
      { date: "3/10/2026", weight: 77.2 },
      { date: "3/31/2026", weight: 77 },
    ],
  },
  {
    name: "ERINE",
    data: [
      { date: "1/16/2026", weight: 55.9 },
      { date: "1/30/2026", weight: 56.4 },
      { date: "2/25/2026", weight: 55.7 },
      { date: "3/10/2026", weight: 57 },
      { date: "3/31/2026", weight: 57.6 },
    ],
  },
  {
    name: "JAZ",
    data: [
      { date: "1/16/2026", weight: 54.9 },
      { date: "1/30/2026", weight: 53.9 },
      { date: "2/25/2026", weight: 55.7 },
      { date: "3/10/2026", weight: null },
      { date: "3/31/2026", weight: 55.5 },
    ],
  },
  {
    name: "JAMES",
    data: [
      { date: "1/16/2026", weight: 81.4 },
      { date: "1/30/2026", weight: 81.1 },
      { date: "2/25/2026", weight: 81.9 },
      { date: "3/10/2026", weight: 81.6 },
      { date: "3/31/2026", weight: 82.1 },
    ],
  },
  {
    name: "RAVEN",
    data: [
      { date: "1/16/2026", weight: 53.2 },
      { date: "1/30/2026", weight: null },
      { date: "2/25/2026", weight: 53.4 },
      { date: "3/10/2026", weight: null },
      { date: "3/31/2026", weight: null },
    ],
  },
  {
    name: "LAWRENCE",
    data: [
      { date: "1/16/2026", weight: 57.7 },
      { date: "1/30/2026", weight: 58.5 },
      { date: "2/25/2026", weight: 58.7 },
      { date: "3/10/2026", weight: 58.6 },
      { date: "3/31/2026", weight: 59.1 },
    ],
  },
  {
    name: "POLA",
    data: [
      { date: "1/16/2026", weight: 71.9 },
      { date: "1/30/2026", weight: null },
      { date: "2/25/2026", weight: 71.1 },
      { date: "3/10/2026", weight: 71 },
      { date: "3/31/2026", weight: 71.8 },
    ],
  },
  {
    name: "VINCE",
    data: [
      { date: "1/16/2026", weight: 99.5 },
      { date: "1/30/2026", weight: null },
      { date: "2/25/2026", weight: null },
      { date: "3/10/2026", weight: null },
      { date: "3/31/2026", weight: null },
    ],
  },
  {
    name: "MAM AI",
    data: [
      { date: "1/16/2026", weight: 54 },
      { date: "1/30/2026", weight: null },
      { date: "2/25/2026", weight: null },
      { date: "3/10/2026", weight: 53.2 },
      { date: "3/31/2026", weight: null },
    ],
  },
  {
    name: "KYLA",
    data: [
      { date: "1/16/2026", weight: 54.9 },
      { date: "1/30/2026", weight: null },
      { date: "2/25/2026", weight: 54.9 },
      { date: "3/10/2026", weight: null },
      { date: "3/31/2026", weight: null },
    ],
  },
  {
    name: "DIANE",
    data: [
      { date: "1/16/2026", weight: null },
      { date: "1/30/2026", weight: 62 },
      { date: "2/25/2026", weight: 63.3 },
      { date: "3/10/2026", weight: null },
      { date: "3/31/2026", weight: 64.6 },
    ],
  },
  {
    name: "MAM JOY",
    data: [
      { date: "1/16/2026", weight: 53.2 },
      { date: "1/30/2026", weight: null },
      { date: "2/25/2026", weight: 54.5 },
      { date: "3/10/2026", weight: 54.1 },
      { date: "3/31/2026", weight: null },
    ],
  },
  {
    name: "ANDREA",
    data: [
      { date: "1/16/2026", weight: null },
      { date: "1/30/2026", weight: null },
      { date: "2/25/2026", weight: 38.9 },
      { date: "3/10/2026", weight: null },
      { date: "3/31/2026", weight: null },
    ],
  },
  {
    name: "AR.",
    data: [
      { date: "1/16/2026", weight: null },
      { date: "1/30/2026", weight: null },
      { date: "2/25/2026", weight: 82 },
      { date: "3/10/2026", weight: null },
      { date: "3/31/2026", weight: null },
    ],
  },
  {
    name: "MAM CRI",
    data: [
      { date: "1/16/2026", weight: null },
      { date: "1/30/2026", weight: null },
      { date: "2/25/2026", weight: null },
      { date: "3/10/2026", weight: 46.3 },
      { date: "3/31/2026", weight: null },
    ],
  },
  {
    name: "ZOREN",
    data: [
      { date: "1/16/2026", weight: null },
      { date: "1/30/2026", weight: null },
      { date: "2/25/2026", weight: null },
      { date: "3/10/2026", weight: null },
      { date: "3/31/2026", weight: 60 },
    ],
  },
];
