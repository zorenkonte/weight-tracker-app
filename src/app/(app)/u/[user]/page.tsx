import { readStore } from "@/lib/store.server";
import { UserPageClient } from "./user-page-client";

export default async function Page() {
  const { people } = await readStore();
  return <UserPageClient initialPeople={people} />;
}
