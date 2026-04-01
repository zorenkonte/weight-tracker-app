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
  id?: string | null;
  handle?: string | null;
  colorIndex?: number | null;
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
        // Add columns introduced after initial schema (idempotent)
        await conn.run("ALTER TABLE members ADD COLUMN IF NOT EXISTS color_index INTEGER");
        await conn.run("ALTER TABLE members ADD COLUMN IF NOT EXISTS handle TEXT");
        await conn.run("ALTER TABLE members ADD COLUMN IF NOT EXISTS member_id TEXT");
        // Backfill member_id for any existing rows that don't have one
        const needIds = await conn.runAndReadAll("SELECT name FROM members WHERE member_id IS NULL");
        const needIdsRows = needIds.getRowObjects() as Array<{ name: string }>;
        const { randomUUID } = await import("crypto");
        for (const row of needIdsRows) {
          await conn.run("UPDATE members SET member_id = $id WHERE name = $name", { id: randomUUID(), name: row.name });
        }
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
          const { randomUUID: seedUUID } = await import("crypto");
          for (const person of SEED_DATA) {
            await conn.run(
              "INSERT INTO members (name, member_id) VALUES ($name, $member_id) ON CONFLICT DO NOTHING",
              { name: person.name, member_id: seedUUID() }
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
      SELECT m.name, m.member_id, m.color_index, m.handle, e.session_date, e.weight
      FROM members m
      LEFT JOIN entries e ON m.name = e.member_name
      ORDER BY m.rowid, e.session_date
    `);
    const rows = reader.getRowObjects() as Array<{
      name: string;
      member_id: string | null;
      color_index: number | null;
      handle: string | null;
      session_date: string | null;
      weight: number | null;
    }>;

    const peopleMap = new Map<string, Person>();
    for (const row of rows) {
      if (!peopleMap.has(row.name)) {
        peopleMap.set(row.name, {
          name: row.name,
          id: row.member_id ?? null,
          handle: row.handle ?? null,
          colorIndex: row.color_index !== undefined && row.color_index !== null ? Number(row.color_index) : null,
          data: [],
        });
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

export async function saveMemberMeta(
  name: string,
  colorIndex: number | null,
  handle: string | null
): Promise<void> {
  await ensureInit();
  const conn = await getConn();
  try {
    await conn.run(
      "UPDATE members SET color_index = $colorIndex, handle = $handle WHERE name = $name",
      { colorIndex: colorIndex ?? null, handle: handle ?? null, name }
    );
  } finally {
    conn.closeSync();
  }
}

export async function addMember(name: string): Promise<void> {
  await ensureInit();
  const { randomUUID } = await import("crypto");
  const conn = await getConn();
  try {
    await conn.run(
      "INSERT INTO members (name, member_id) VALUES ($name, $member_id) ON CONFLICT DO NOTHING",
      { name, member_id: randomUUID() }
    );
  } finally {
    conn.closeSync();
  }
}

export async function renameMember(oldName: string, newName: string): Promise<void> {
  await ensureInit();
  const conn = await getConn();
  try {
    // Insert new name with existing metadata, then reassign entries, then delete old
    await conn.run(
      `INSERT INTO members (name, color_index, handle)
       SELECT $newName, color_index, handle
       FROM members
       WHERE name = $oldName
       ON CONFLICT DO NOTHING`,
      { newName, oldName }
    );
    await conn.run(
      "UPDATE entries SET member_name = $newName WHERE member_name = $oldName",
      { newName, oldName }
    );
    await conn.run("DELETE FROM members WHERE name = $name", { name: oldName });
  } finally {
    conn.closeSync();
  }
}

export async function deleteMember(name: string): Promise<void> {
  await ensureInit();
  const conn = await getConn();
  try {
    await conn.run("DELETE FROM entries WHERE member_name = $name", { name });
    await conn.run("DELETE FROM members WHERE name = $name", { name });
  } finally {
    conn.closeSync();
  }
}

export async function resetStore(): Promise<void> {
  await ensureInit();
  const conn = await getConn();
  try {
    await conn.run("DELETE FROM entries");
    await conn.run("DELETE FROM members");
  } finally {
    conn.closeSync();
  }
}

export async function importStore(people: Person[]): Promise<void> {
  await ensureInit();
  const conn = await getConn();
  try {
    await conn.run("DELETE FROM entries");
    await conn.run("DELETE FROM members");
    const { randomUUID: importUUID } = await import("crypto");
    for (const person of people) {
      await conn.run(
        "INSERT INTO members (name, member_id) VALUES ($name, $member_id) ON CONFLICT DO NOTHING",
        { name: person.name, member_id: importUUID() }
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
  } finally {
    conn.closeSync();
  }
}

