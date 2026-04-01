import { readStore } from "@/lib/store.server";
import { MembersSectionPage } from "../settings-client";

export default async function MembersPage() {
  const { people } = await readStore();
  return <MembersSectionPage initialPeople={people} />;
}
