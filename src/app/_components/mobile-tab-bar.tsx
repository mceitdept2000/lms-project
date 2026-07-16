"use client";

import { FileQuestion, FileText, LogIn, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { authClient } from "~/server/better-auth/client";

export function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const tabs: { href: string; label: string; icon: typeof FileText }[] = [
    { href: "/notes", label: "Notes", icon: FileText },
    { href: "/question-papers", label: "Papers", icon: FileQuestion },
    ...(session?.user
      ? [{ href: "/admin", label: "Admin", icon: Shield }]
      : []),
  ];

  return (
    <nav
      aria-label="Primary"
      className="border-accent/30 bg-secondary fixed inset-x-0 bottom-0 z-30 flex items-stretch border-t md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              active ? "text-primary" : "text-accent"
            }`}
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      {session?.user ? (
        <button
          type="button"
          className="text-accent flex flex-1 flex-col items-center gap-0.5 py-2 text-xs"
          onClick={() => {
            void authClient.signOut().then(() => router.push("/"));
          }}
        >
          <LogOut size={20} aria-hidden="true" />
          Log out
        </button>
      ) : (
        <Link
          href="/login"
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
            pathname === "/login" ? "text-primary" : "text-accent"
          }`}
        >
          <LogIn size={20} aria-hidden="true" />
          Log in
        </Link>
      )}
    </nav>
  );
}
