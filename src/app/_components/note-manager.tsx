"use client";

import { useState } from "react";

import { DataTable, type DataTableColumn } from "~/app/_components/data-table";
import { PaginationControls } from "~/app/_components/pagination-controls";
import { DEFAULT_PAGE_SIZE, type PageSize } from "~/lib/constants";
import { type RouterOutputs, api } from "~/trpc/react";

type NoteRow = RouterOutputs["note"]["list"]["items"][number];

export function NoteManager() {
  const utils = api.useUtils();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);

  const { data, isLoading } = api.note.list.useQuery({ page, pageSize });

  const softDelete = api.note.softDelete.useMutation({
    onSuccess: () => utils.note.list.invalidate(),
  });

  function onDelete(note: NoteRow) {
    if (window.confirm(`Delete "${note.title}"? This cannot be undone.`)) {
      softDelete.mutate({ id: note.id });
    }
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
      <h2 className="font-semibold">Notes</h2>
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
