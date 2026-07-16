"use client";

import { FileQuestion } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { CardGrid } from "~/app/_components/card-grid";
import { DataTable, type DataTableColumn } from "~/app/_components/data-table";
import { FilterSelect } from "~/app/_components/filter-select";
import { PaginationControls } from "~/app/_components/pagination-controls";
import { SearchBar } from "~/app/_components/search-bar";
import { ViewToggle, type ViewMode } from "~/app/_components/view-toggle";
import {
  DEFAULT_PAGE_SIZE,
  REGULATIONS,
  type Regulation,
} from "~/lib/constants";
import { useIsMobile } from "~/hooks/use-is-mobile";
import { usePdfThumbnail } from "~/hooks/use-pdf-thumbnail";
import { type RouterOutputs, api } from "~/trpc/react";

type QuestionPaperRow = RouterOutputs["questionPaper"]["list"]["items"][number];

function QuestionPaperCard({ paper }: { paper: QuestionPaperRow }) {
  const thumbnailPath = usePdfThumbnail({
    id: paper.id,
    kind: "question-papers",
    storagePath: paper.storagePath,
    thumbnailPath: paper.thumbnailPath,
  });

  return (
    <div className="border-accent/30 hover:border-primary/50 flex h-full flex-col gap-3 overflow-hidden rounded-[8px] border p-4 transition-colors">
      {thumbnailPath && (
        <div className="bg-accent/5 relative -mx-4 -mt-4 h-64 overflow-hidden rounded-t-[8px] sm:h-40">
          <Image
            src={`/api/files/${thumbnailPath}`}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-top"
          />
        </div>
      )}
      <div className="flex items-start gap-3">
        {!thumbnailPath && (
          <FileQuestion
            className="text-primary mt-0.5 shrink-0"
            size={20}
            aria-hidden="true"
          />
        )}
        <div className="min-w-0">
          <p className="line-clamp-2 font-semibold">{paper.exam.name}</p>
          <p className="text-accent text-sm">{paper.exam.code}</p>
        </div>
      </div>
      <div className="text-accent text-sm">
        {paper.subject.shortName} ({paper.subject.code}) &middot;{" "}
        {paper.subject.regulation}
      </div>
      <div className="text-accent mt-auto flex items-center justify-end text-xs">
        <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
      </div>
      <a
        className="border-accent text-primary hover:bg-primary/5 rounded-[8px] border px-3 py-2 text-center text-sm font-medium"
        href={`/api/files/${paper.storagePath}`}
      >
        Download
      </a>
    </div>
  );
}

export function QuestionPapersBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const regulation = searchParams.get("regulation") ?? "";
  const examCode = searchParams.get("examCode") ?? "";
  const subjectCode = searchParams.get("subjectCode") ?? "";
  const sortDir =
    (searchParams.get("sortDir") as "asc" | "desc" | null) ?? "desc";
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(
    searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE),
  );
  const isMobile = useIsMobile();
  const view =
    (searchParams.get("view") as ViewMode | null) ??
    (isMobile ? "grid" : "list");

  const { data: exams, isLoading: examsLoading } = api.exam.list.useQuery();
  const { data: subjects, isLoading: subjectsLoading } =
    api.subject.list.useQuery();
  const { data, isLoading } = api.questionPaper.list.useQuery({
    search: search || undefined,
    regulation: (regulation || undefined) as Regulation | undefined,
    examCode: examCode || undefined,
    subjectCode: subjectCode || undefined,
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

  const columns: DataTableColumn<QuestionPaperRow>[] = [
    { header: "Exam Name", cell: (row) => row.exam.name },
    { header: "Exam Code", cell: (row) => row.exam.code },
    {
      header: "Subject",
      cell: (row) => `${row.subject.shortName} (${row.subject.code})`,
    },
    { header: "Regulation", cell: (row) => row.subject.regulation },
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
        placeholder="Search by exam name, exam code, subject name or subject code"
      >
        <button
          type="button"
          className="border-accent rounded-[8px] border px-3 py-2.5 text-sm"
          onClick={() =>
            setParams({ sortDir: sortDir === "desc" ? "asc" : "desc" })
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
          label="Regulation"
          value={regulation}
          onChange={(v) => setParams({ regulation: v })}
          options={REGULATIONS.map((r) => ({ value: r, label: r }))}
        />
        <FilterSelect
          label="Exam code"
          value={examCode}
          onChange={(v) => setParams({ examCode: v })}
          options={(exams ?? []).map((e) => ({ value: e.code, label: e.code }))}
          searchable
          loading={examsLoading}
        />
        <FilterSelect
          label="Subject code"
          value={subjectCode}
          onChange={(v) => setParams({ subjectCode: v })}
          options={(subjects ?? []).map((s) => ({
            value: s.code,
            label: s.code,
          }))}
          searchable
          loading={subjectsLoading}
        />
      </div>

      {view === "grid" ? (
        <CardGrid
          items={data?.items ?? []}
          renderCard={(paper) => <QuestionPaperCard paper={paper} />}
          isLoading={isLoading}
          loadingLabel="Loading question papers..."
          emptyIcon={FileQuestion}
          emptyTitle="No question papers found"
          emptyDescription={
            search || regulation || examCode || subjectCode
              ? "Try adjusting your search or filters."
              : "Question papers uploaded by staff will appear here."
          }
        />
      ) : (
        <DataTable
          columns={columns}
          rows={data?.items ?? []}
          isLoading={isLoading}
          loadingLabel="Loading question papers..."
          emptyIcon={FileQuestion}
          emptyTitle="No question papers found"
          emptyDescription={
            search || regulation || examCode || subjectCode
              ? "Try adjusting your search or filters."
              : "Question papers uploaded by staff will appear here."
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
