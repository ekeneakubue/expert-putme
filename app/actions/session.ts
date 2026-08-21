"use server";

import { redirect } from "next/navigation";
import { clearCandidate } from "@/lib/candidate";

export async function leaveHall() {
  await clearCandidate();
  redirect("/");
}
