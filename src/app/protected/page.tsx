import { getSession } from "@/sanity/utils/auth";
import { redirect } from "next/navigation";
import { clientNoCdn } from "../../../sanity.client";
import { signInPageEnabledQuery } from "../../sanity/lib/queries";

export default async function Protected() {
  const session = await getSession();

  if (!session.isAuthenticated) {
    const signInEnabled = await clientNoCdn.fetch(signInPageEnabledQuery, {}, { next: { revalidate: 0 } });
    if (signInEnabled) {
      redirect("/sign-in");
    }
  }

  return (
    <main>
      <h1>🔒 Protected page</h1>
      <p>This page is password protected!</p>
    </main>
  );
}