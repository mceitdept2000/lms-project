import type { LucideIcon } from "lucide-react";

import { EmptyState } from "~/app/_components/ui/empty-state";
import { LoadingState } from "~/app/_components/ui/loading-state";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  isLoading = false,
  loadingLabel = "Loading...",
  emptyIcon,
  emptyTitle = "No results",
  emptyDescription,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  loadingLabel?: string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <div className="border-accent/30 overflow-x-auto rounded-[8px] border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-accent/30 border-b bg-primary/5">
            {columns.map((col) => (
              <th key={col.header} className="text-accent px-4 py-3 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-accent/15 divide-y">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                <LoadingState label={loadingLabel} />
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                data-row-id={row.id}
                className="hover:bg-primary/5"
              >
                {columns.map((col) => (
                  <td key={col.header} className="px-4 py-4">
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
