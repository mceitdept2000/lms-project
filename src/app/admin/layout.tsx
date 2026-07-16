import Link from "next/link";
import { redirect } from "next/navigation";

import type { Permission } from "~/lib/constants";
import { getSession } from "~/server/better-auth/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const permissions = session.user.permissions as Permission[];

  const sections: { href: string; label: string; permission: Permission }[] = [
    {
      href: "/admin/subjects",
      label: "Subjects",
      permission: "MANAGE_CATALOG",
    },
    { href: "/admin/exams", label: "Exams", permission: "MANAGE_CATALOG" },
    { href: "/admin/uploads", label: "Uploads", permission: "UPLOAD_FILES" },
    { href: "/admin/users", label: "Users", permission: "MANAGE_USERS" },
  ];

  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-4 py-8">
      <nav className="flex w-48 shrink-0 flex-col gap-2 text-sm">
        <Link href="/admin" className="text-primary font-semibold">
          Admin
        </Link>
        {sections
          .filter((s) => permissions.includes(s.permission))
          .map((s) => (
            <Link key={s.href} href={s.href}>
              {s.label}
            </Link>
          ))}
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
