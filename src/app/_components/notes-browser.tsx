"use client";

import { FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { CardGrid } from "~/app/_components/card-grid";
import { DataTable, type DataTableColumn } from "~/app/_components/data-table";
import { FilterSelect } from "~/app/_components/filter-select";
import { PaginationControls } from "~/app/_components/pagination-controls";
import { SearchBar } from "~/app/_components/search-bar";
import { ViewToggle, type ViewMode } from "~/app/_components/view-toggle";
import {
  DEFAULT_PAGE_SIZE,
  SEMESTERS,
  YEARS,
  type Semester,
  type Year,
} from "~/lib/constants";
import { type RouterOutputs, api } from "~/trpc/react";

type NoteRow = RouterOutputs["note"]["list"]["items"][number];

function NoteCard({ note }: { note: NoteRow }) {
  return (
    <div className="border-accent/30 hover:border-primary/50 flex h-full flex-col gap-3 rounded-[8px] border p-4 transition-colors">
      <div className="flex items-start gap-3">
        <FileText
          className="text-primary mt-0.5 shrink-0"
          size={20}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="line-clamp-2 font-semibold">{note.title}</p>
          <p className="text-accent text-sm">
            {note.subject.shortName} ({note.subject.code})
          </p>
        </div>
      </div>
      <div className="text-accent mt-auto flex items-center justify-between text-xs">
        <span>Unit {note.unit && note.unit !== "-1" ? note.unit : "All"}</span>
        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
      </div>
      <a
        className="border-accent text-primary hover:bg-primary/5 rounded-[8px] border px-3 py-2 text-center text-sm font-medium"
        href={`/api/files/${note.storagePath}`}
      >
        Download
      </a>
    </div>
  );
}

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
  const view = (searchParams.get("view") as ViewMode | null) ?? "list";

  const { data: subjects, isLoading: subjectsLoading } =
    api.subject.list.useQuery();
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
        placeholder="Search notes by title or subject"
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
        <ViewToggle
          value={view}
          onChange={(v) => setParams({ view: v, page })}
        />
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
          searchable
          loading={subjectsLoading}
        />
      </div>

      {view === "grid" ? (
        <CardGrid
          items={data?.items ?? []}
          renderCard={(note) => <NoteCard note={note} />}
          isLoading={isLoading}
          loadingLabel="Loading notes..."
          emptyIcon={FileText}
          emptyTitle="No notes found"
          emptyDescription={
            search || semester || year || subjectId
              ? "Try adjusting your search or filters."
              : "Notes uploaded by staff will appear here."
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          isLoading={isLoading}
          loadingLabel="Loading notes..."
          emptyIcon={FileText}
          emptyTitle="No notes found"
          emptyDescription={
            search || semester || year || subjectId
              ? "Try adjusting your search or filters."
              : "Notes uploaded by staff will appear here."
          }
        />
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
