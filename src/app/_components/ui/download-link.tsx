"use client";

import { useState } from "react";

import { Spinner } from "~/app/_components/ui/spinner";

/**
 * A plain download <a> (native browser download, no fetch/progress tracking)
 * that briefly shows a spinner on click so the user knows it registered —
 * the browser itself owns the actual download progress.
 */
export function DownloadLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [downloading, setDownloading] = useState(false);

  return (
    <a
      href={href}
      className={className}
      onClick={() => {
        setDownloading(true);
        setTimeout(() => setDownloading(false), 1500);
      }}
    >
      {downloading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner size={14} />
          Downloading...
        </span>
      ) : (
        children
      )}
    </a>
  );
}
