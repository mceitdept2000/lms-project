import { ClipboardList, GraduationCap, Upload, Users } from "lucide-react";
import Link from "next/link";

import type { Permission } from "~/lib/constants";
import { getSession } from "~/server/better-auth/server";
import { api } from "~/trpc/server";

const SECTIONS = [
  {
    href: "/admin/subjects",
    label: "Subjects",
    description: "Create and manage subjects across regulations.",
    permission: "MANAGE_CATALOG",
    icon: GraduationCap,
  },
  {
    href: "/admin/exams",
    label: "Exams",
    description: "Create end-semester, IAT, and assignment exams.",
    permission: "MANAGE_CATALOG",
    icon: ClipboardList,
  },
  {
    href: "/admin/uploads",
    label: "Uploads",
    description: "Upload and manage notes and question papers.",
    permission: "UPLOAD_FILES",
    icon: Upload,
  },
  {
    href: "/admin/users",
    label: "Users",
    description: "Create users and manage permissions.",
    permission: "MANAGE_USERS",
    icon: Users,
  },
] as const satisfies {
  href: string;
  label: string;
  description: string;
  permission: Permission;
  icon: typeof GraduationCap;
}[];

export default async function AdminHome() {
  const [session, stats] = await Promise.all([
    getSession(),
    api.dashboard.stats(),
  ]);
  const permissions = (session?.user.permissions ?? []) as Permission[];

  const statCards = [
    { label: "Subjects", value: stats.subjects },
    { label: "Exams", value: stats.exams },
    { label: "Notes", value: stats.notes },
    { label: "Question Papers", value: stats.questionPapers },
    ...(stats.users !== null ? [{ label: "Users", value: stats.users }] : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-primary text-2xl font-bold">
          Welcome{session?.user.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="mt-1 text-sm">
          Manage the LMS catalog, uploads, and users.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="border-accent rounded-[8px] border p-4"
          >
            <div className="text-primary text-2xl font-bold">{card.value}</div>
            <div className="text-sm">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.filter((s) => permissions.includes(s.permission)).map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="border-accent hover:border-primary flex gap-4 rounded-[8px] border p-4 transition-colors"
            >
              <Icon className="text-primary shrink-0" size={28} />
              <div>
                <div className="font-semibold">{s.label}</div>
                <p className="text-sm">{s.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
