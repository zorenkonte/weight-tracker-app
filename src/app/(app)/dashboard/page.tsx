import { readStore } from "@/lib/store.server";
import { DashboardClient } from "../../dashboard-client";

export default async function DashboardPage() {
  const { people } = await readStore();
  return <DashboardClient initialPeople={people} />;
}
