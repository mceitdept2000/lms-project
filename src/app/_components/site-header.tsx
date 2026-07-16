"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "~/server/better-auth/client";

export function SiteHeader() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  return (
    <header className="border-accent/30 bg-secondary text-text border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/mce-logo-2-og.png"
            alt="MCE"
            width={36}
            height={36}
            className="rounded-[8px]"
            priority
          />
          <span className="text-primary text-lg font-bold">MCE LMS</span>
        </Link>

        <nav className="hidden items-center gap-4 text-sm md:flex">
          <Link href="/notes">Notes</Link>
          <Link href="/question-papers">Question Papers</Link>
          {session?.user ? (
            <>
              <Link href="/admin">Admin</Link>
              <button
                type="button"
                className="border-accent rounded-[8px] border px-3 py-1"
                onClick={() => {
                  void authClient.signOut().then(() => router.push("/"));
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="border-accent rounded-[8px] border px-3 py-1"
            >
              Log in
            </Link>
          )}
        </nav>

        <Image
          src="/iqac-logo-og.png"
          alt="IQAC"
          width={36}
          height={36}
          className="rounded-[8px]"
          priority
        />
      </div>
    </header>
  );
}
