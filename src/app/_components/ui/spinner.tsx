import { Loader2 } from "lucide-react";

export function Spinner({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Loader2
      size={size}
      aria-hidden="true"
      className={`text-primary animate-spin ${className}`}
    />
  );
}
