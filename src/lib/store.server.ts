/**
 * Server-side only. Reads/writes a DuckDB database file at the project root.
 * All mutations go through this module — never import it from client code.
 */
import path from "path";
import { DuckDBInstance } from "@duckdb/node-api";
import { weightData, Person, WeightEntry } from "@/data/weight-data";

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
          for (const person of weightData) {
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
      ORDER BY m.name, e.session_date
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

