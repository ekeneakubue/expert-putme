import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Hall pass",
};

export default function StartPage() {
  redirect("/candidate");
}
