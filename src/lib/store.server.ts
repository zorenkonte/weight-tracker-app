/**
 * Server-side only. Reads/writes a DuckDB database file at the project root.
 * All mutations go through this module — never import it from client code.
 */
import path from "path";
import { DuckDBInstance } from "@duckdb/node-api";

interface WeightEntry {
  date: string;
  weight: number | null;
}

interface Person {
  name: string;
  data: WeightEntry[];
}

const SEED_DATA: Person[] = [
  { name: "LAINE", data: [{ date: "1/16/2026", weight: 59 }, { date: "1/30/2026", weight: 59.8 }, { date: "2/25/2026", weight: 60 }, { date: "3/10/2026", weight: null }, { date: "3/31/2026", weight: 61.5 }] },
  { name: "AIKA", data: [{ date: "1/16/2026", weight: 75.9 }, { date: "1/30/2026", weight: 75.9 }, { date: "2/25/2026", weight: 75.6 }, { date: "3/10/2026", weight: 77.2 }, { date: "3/31/2026", weight: 77 }] },
  { name: "ERINE", data: [{ date: "1/16/2026", weight: 55.9 }, { date: "1/30/2026", weight: 56.4 }, { date: "2/25/2026", weight: 55.7 }, { date: "3/10/2026", weight: 57 }, { date: "3/31/2026", weight: 57.6 }] },
  { name: "JAZ", data: [{ date: "1/16/2026", weight: 54.9 }, { date: "1/30/2026", weight: 53.9 }, { date: "2/25/2026", weight: 55.7 }, { date: "3/10/2026", weight: null }, { date: "3/31/2026", weight: 55.5 }] },
  { name: "JAMES", data: [{ date: "1/16/2026", weight: 81.4 }, { date: "1/30/2026", weight: 81.1 }, { date: "2/25/2026", weight: 81.9 }, { date: "3/10/2026", weight: 81.6 }, { date: "3/31/2026", weight: 82.1 }] },
  { name: "RAVEN", data: [{ date: "1/16/2026", weight: 53.2 }, { date: "1/30/2026", weight: null }, { date: "2/25/2026", weight: 53.4 }, { date: "3/10/2026", weight: null }, { date: "3/31/2026", weight: null }] },
  { name: "LAWRENCE", data: [{ date: "1/16/2026", weight: 57.7 }, { date: "1/30/2026", weight: 58.5 }, { date: "2/25/2026", weight: 58.7 }, { date: "3/10/2026", weight: 58.6 }, { date: "3/31/2026", weight: 59.1 }] },
  { name: "POLA", data: [{ date: "1/16/2026", weight: 71.9 }, { date: "1/30/2026", weight: null }, { date: "2/25/2026", weight: 71.1 }, { date: "3/10/2026", weight: 71 }, { date: "3/31/2026", weight: 71.8 }] },
  { name: "VINCE", data: [{ date: "1/16/2026", weight: 99.5 }, { date: "1/30/2026", weight: null }, { date: "2/25/2026", weight: null }, { date: "3/10/2026", weight: null }, { date: "3/31/2026", weight: null }] },
  { name: "MAM AI", data: [{ date: "1/16/2026", weight: 54 }, { date: "1/30/2026", weight: null }, { date: "2/25/2026", weight: null }, { date: "3/10/2026", weight: 53.2 }, { date: "3/31/2026", weight: null }] },
  { name: "KYLA", data: [{ date: "1/16/2026", weight: 54.9 }, { date: "1/30/2026", weight: null }, { date: "2/25/2026", weight: 54.9 }, { date: "3/10/2026", weight: null }, { date: "3/31/2026", weight: null }] },
  { name: "DIANE", data: [{ date: "1/16/2026", weight: null }, { date: "1/30/2026", weight: 62 }, { date: "2/25/2026", weight: 63.3 }, { date: "3/10/2026", weight: null }, { date: "3/31/2026", weight: 64.6 }] },
  { name: "MAM JOY", data: [{ date: "1/16/2026", weight: 53.2 }, { date: "1/30/2026", weight: null }, { date: "2/25/2026", weight: 54.5 }, { date: "3/10/2026", weight: 54.1 }, { date: "3/31/2026", weight: null }] },
  { name: "ANDREA", data: [{ date: "1/16/2026", weight: null }, { date: "1/30/2026", weight: null }, { date: "2/25/2026", weight: 38.9 }, { date: "3/10/2026", weight: null }, { date: "3/31/2026", weight: null }] },
  { name: "AR.", data: [{ date: "1/16/2026", weight: null }, { date: "1/30/2026", weight: null }, { date: "2/25/2026", weight: 82 }, { date: "3/10/2026", weight: null }, { date: "3/31/2026", weight: null }] },
  { name: "MAM CRI", data: [{ date: "1/16/2026", weight: null }, { date: "1/30/2026", weight: null }, { date: "2/25/2026", weight: null }, { date: "3/10/2026", weight: 46.3 }, { date: "3/31/2026", weight: null }] },
  { name: "ZOREN", data: [{ date: "1/16/2026", weight: null }, { date: "1/30/2026", weight: null }, { date: "2/25/2026", weight: null }, { date: "3/10/2026", weight: null }, { date: "3/31/2026", weight: 60 }] },
];

export interface Store {
  people: Person[];
}

const DB_PATH = path.join(process.cwd(), "data.duckdb");

async function getConn() {
  const instance = await DuckDBInstance.fromCache(DB_PATH);
  return instance.connect();
}

// Singleton init promise — safe across hot reloads because CREATE IF NOT EXISTS is idempotent
// and the seed guard (COUNT > 0) prevents double-seeding.
let initPromise: Promise<void> | null = null;

function ensureInit(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const conn = await getConn();
      try {
        await conn.run(
          `CREATE TABLE IF NOT EXISTS members (name TEXT PRIMARY KEY)`
        );
        await conn.run(`
          CREATE TABLE IF NOT EXISTS entries (
            member_name TEXT NOT NULL,
            session_date TEXT NOT NULL,
            weight DOUBLE,
            PRIMARY KEY (member_name, session_date),
            FOREIGN KEY (member_name) REFERENCES members(name)
          )
        `);

        // Seed on first run
        const reader = await conn.runAndReadAll(
          "SELECT COUNT(*) AS c FROM members"
        );
        const rows = reader.getRowObjects() as Array<{ c: bigint | number }>;
        if (Number(rows[0].c) === 0) {
          for (const person of SEED_DATA) {
            await conn.run(
              "INSERT INTO members (name) VALUES ($name) ON CONFLICT DO NOTHING",
              { name: person.name }
            );
            for (const entry of person.data) {
              await conn.run(
                `INSERT INTO entries (member_name, session_date, weight)
                 VALUES ($member_name, $session_date, $weight)
                 ON CONFLICT DO NOTHING`,
                {
                  member_name: person.name,
                  session_date: entry.date,
                  weight: entry.weight ?? null,
                }
              );
            }
          }
        }
      } finally {
        conn.closeSync();
      }
    })();
  }
  return initPromise;
}

export async function readStore(): Promise<Store> {
  await ensureInit();
  const conn = await getConn();
  try {
    const reader = await conn.runAndReadAll(`
      SELECT m.name, e.session_date, e.weight
      FROM members m
      LEFT JOIN entries e ON m.name = e.member_name
      ORDER BY m.rowid, e.session_date
    `);
    const rows = reader.getRowObjects() as Array<{
      name: string;
      session_date: string | null;
      weight: number | null;
    }>;

    const peopleMap = new Map<string, Person>();
    for (const row of rows) {
      if (!peopleMap.has(row.name)) {
        peopleMap.set(row.name, { name: row.name, data: [] });
      }
      if (row.session_date !== null) {
        peopleMap.get(row.name)!.data.push({
          date: row.session_date,
          weight: row.weight ?? null,
        } as WeightEntry);
      }
    }

    return { people: Array.from(peopleMap.values()) };
  } finally {
    conn.closeSync();
  }
}

export async function writeStore(store: Store): Promise<void> {
  await ensureInit();
  const conn = await getConn();
  try {
    for (const person of store.people) {
      await conn.run(
        "INSERT INTO members (name) VALUES ($name) ON CONFLICT DO NOTHING",
        { name: person.name }
      );
      for (const entry of person.data) {
        await conn.run(
          `INSERT INTO entries (member_name, session_date, weight)
           VALUES ($member_name, $session_date, $weight)
           ON CONFLICT (member_name, session_date)
           DO UPDATE SET weight = excluded.weight`,
          {
            member_name: person.name,
            session_date: entry.date,
            weight: entry.weight ?? null,
          }
        );
      }
    }
  } finally {
    conn.closeSync();
  }
}

