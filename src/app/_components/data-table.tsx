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
    <table className="w-full text-left text-sm">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.header}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {isLoading ? (
          <tr>
            <td colSpan={columns.length}>
              <LoadingState label={loadingLabel} />
            </td>
          </tr>
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length}>
              <EmptyState
                icon={emptyIcon}
                title={emptyTitle}
                description={emptyDescription}
              />
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id} data-row-id={row.id}>
              {columns.map((col) => (
                <td key={col.header}>{col.cell(row)}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
