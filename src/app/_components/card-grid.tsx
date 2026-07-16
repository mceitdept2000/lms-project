import type { LucideIcon } from "lucide-react";

import { EmptyState } from "~/app/_components/ui/empty-state";
import { LoadingState } from "~/app/_components/ui/loading-state";

export function CardGrid<T extends { id: string }>({
  items,
  renderCard,
  isLoading = false,
  loadingLabel = "Loading...",
  emptyIcon,
  emptyTitle = "No results",
  emptyDescription,
}: {
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (isLoading) {
    return <LoadingState label={loadingLabel} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.id} data-card-id={item.id}>
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
}
