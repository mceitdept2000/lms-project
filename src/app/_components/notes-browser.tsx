"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { DataTable, type DataTableColumn } from "~/app/_components/data-table";
import { FilterSelect } from "~/app/_components/filter-select";
import { PaginationControls } from "~/app/_components/pagination-controls";
import { SearchBar } from "~/app/_components/search-bar";
import {
  DEFAULT_PAGE_SIZE,
  SEMESTERS,
  YEARS,
  type Semester,
  type Year,
} from "~/lib/constants";
import { type RouterOutputs, api } from "~/trpc/react";

type NoteRow = RouterOutputs["note"]["list"]["items"][number];

export function NotesBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const semester = searchParams.get("semester") ?? "";
  const year = searchParams.get("year") ?? "";
  const subjectId = searchParams.get("subjectId") ?? "";
  const sortDir =
    (searchParams.get("sortDir") as "asc" | "desc" | null) ?? "desc";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(
    searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
  );

  const { data: subjects } = api.subject.list.useQuery();
  const { data, isLoading } = api.note.list.useQuery({
    search: search || undefined,
    semester: (semester || undefined) as Semester | undefined,
    year: (year || undefined) as Year | undefined,
    subjectId: subjectId || undefined,
    sortDir,
    page,
    pageSize,
  });

  function setParams(updates: Record<string, string | number | undefined>) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    }
    if (!("page" in updates)) next.set("page", "1");
    router.push(`?${next.toString()}`);
  }

  const columns: DataTableColumn<NoteRow>[] = [
    { header: "Title", cell: (row) => row.title },
    {
      header: "Subject",
      cell: (row) => `${row.subject.shortName} (${row.subject.code})`,
    },
    {
      header: "Unit",
      cell: (row) => (row.unit && row.unit !== "-1" ? row.unit : "All"),
    },
    {
      header: "Uploaded",
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      header: "Download",
      cell: (row) => (
        <a
          className="text-primary underline"
          href={`/api/files/${row.storagePath}`}
        >
          Download
        </a>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <SearchBar
        value={search}
        onChange={(v) => setParams({ search: v })}
        placeholder="Search notes by title"
      >
        <button
          type="button"
          className="border-accent rounded-[8px] border px-3 py-2 text-sm"
          onClick={() =>
            setParams({
              sortDir: sortDir === "desc" ? "asc" : "desc",
            })
          }
        >
          Sort: {sortDir === "desc" ? "Newest" : "Oldest"}
        </button>
      </SearchBar>

      <div className="flex flex-wrap gap-4">
        <FilterSelect
          label="Semester"
          value={semester}
          onChange={(v) => setParams({ semester: v })}
          options={SEMESTERS.map((s) => ({ value: s, label: s }))}
        />
        <FilterSelect
          label="Year"
          value={year}
          onChange={(v) => setParams({ year: v })}
          options={YEARS.map((y) => ({ value: y, label: y }))}
        />
        <FilterSelect
          label="Subject"
          value={subjectId}
          onChange={(v) => setParams({ subjectId: v })}
          options={(subjects ?? []).map((s) => ({
            value: s.id,
            label: s.code,
          }))}
        />
      </div>

      {isLoading ? (
        <p className="text-sm">Loading...</p>
      ) : (
        <DataTable columns={columns} rows={data?.items ?? []} />
      )}

      {data && (
        <PaginationControls
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={(p) => setParams({ page: p })}
          onPageSizeChange={(size) => setParams({ pageSize: size, page: 1 })}
        />
      )}
    </div>
  );
}
