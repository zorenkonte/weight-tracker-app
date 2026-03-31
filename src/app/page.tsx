import { redirect } from "next/navigation";
import { weightData } from "@/data/weight-data";

export default function Home() {
  redirect(`/${weightData[0].name.toLowerCase()}`);
}
