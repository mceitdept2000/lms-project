import { useEffect, useState } from "react";

import type { FileKind } from "~/lib/constants";
import { renderPdfFirstPageFromArrayBuffer } from "~/lib/pdf-thumbnail";
import { uploadToSignedUrl } from "~/lib/storage-upload";
import { api } from "~/trpc/react";

/** Serializes backfill jobs so a page full of un-thumbnailed PDFs doesn't render/upload all at once. */
const inFlight = new Set<string>();
let queueTail: Promise<void> = Promise.resolve();
function enqueue(job: () => Promise<void>) {
  queueTail = queueTail.then(job, job);
  return queueTail;
}

/**
 * Returns the thumbnail path for a note/question paper, backfilling it client-side
 * (render page 1, upload, save) the first time an un-thumbnailed PDF is viewed.
 */
export function usePdfThumbnail({
  id,
  kind,
  storagePath,
  thumbnailPath,
}: {
  id: string;
  kind: FileKind;
  storagePath: string;
  thumbnailPath: string | null;
}): string | null {
  const [resolvedPath, setResolvedPath] = useState(thumbnailPath);

  const requestThumbnailUploadUrl =
    api.upload.requestThumbnailUploadUrl.useMutation();
  const setNoteThumbnail = api.note.setThumbnail.useMutation();
  const setQuestionPaperThumbnail =
    api.questionPaper.setThumbnail.useMutation();

  useEffect(() => {
    if (resolvedPath || !storagePath.endsWith(".pdf")) return;
    if (inFlight.has(id)) return;
    inFlight.add(id);

    void enqueue(async () => {
      try {
        const { key, signedUrl } = await requestThumbnailUploadUrl.mutateAsync(
          { kind, storagePath },
        );

        // signedUrl is null when the thumbnail was already uploaded previously
        // but the DB never got told about it (e.g. an interrupted setThumbnail
        // call) — nothing left to render/upload, just adopt the existing key.
        if (signedUrl) {
          const res = await fetch(`/api/files/${storagePath}`);
          if (!res.ok) return;
          const blob = await renderPdfFirstPageFromArrayBuffer(
            await res.arrayBuffer(),
          );
          if (!blob) return;
          await uploadToSignedUrl(signedUrl, blob);
        }

        if (kind === "notes") {
          await setNoteThumbnail.mutateAsync({ id, thumbnailPath: key });
        } else {
          await setQuestionPaperThumbnail.mutateAsync({
            id,
            thumbnailPath: key,
          });
        }
        setResolvedPath(key);
      } catch {
        // best-effort backfill; leave the icon fallback in place
      } finally {
        inFlight.delete(id);
      }
    });
    // Mutation objects are stable across renders; re-running only on identity/content changes is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, kind, storagePath, resolvedPath]);

  return resolvedPath;
}
