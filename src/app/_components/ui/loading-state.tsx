import { Spinner } from "~/app/_components/ui/spinner";

export function LoadingState({
  label = "Loading...",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={`text-accent flex flex-col items-center justify-center gap-2 py-12 text-sm ${className}`}
    >
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
