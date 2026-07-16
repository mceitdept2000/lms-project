"use client";

import { FileQuestion } from "lucide-react";
import { useState } from "react";

import { DataTable, type DataTableColumn } from "~/app/_components/data-table";
import { PaginationControls } from "~/app/_components/pagination-controls";
import { DEFAULT_PAGE_SIZE, type PageSize } from "~/lib/constants";
import { type RouterOutputs, api } from "~/trpc/react";

type QuestionPaperRow = RouterOutputs["questionPaper"]["list"]["items"][number];

export function QuestionPaperManager() {
  const utils = api.useUtils();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);

  const { data, isLoading } = api.questionPaper.list.useQuery({
    page,
    pageSize,
  });

  const softDelete = api.questionPaper.softDelete.useMutation({
    onSuccess: () => utils.questionPaper.list.invalidate(),
  });

  function onDelete(qp: QuestionPaperRow) {
    if (
      window.confirm(
        `Delete the ${qp.exam.code} paper for ${qp.subject.code}? This cannot be undone.`,
      )
    ) {
      softDelete.mutate({ id: qp.id });
    }
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
    {
      header: "",
      cell: (row) => (
        <button
          type="button"
          className="text-sm text-red-600 underline"
          disabled={softDelete.isPending}
          onClick={() => onDelete(row)}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold">Question Papers</h2>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        isLoading={isLoading}
        loadingLabel="Loading question papers..."
        emptyIcon={FileQuestion}
        emptyTitle="No question papers yet"
        emptyDescription="Question papers you upload above will show up here."
      />
      {data && (
        <PaginationControls
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size as PageSize);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
