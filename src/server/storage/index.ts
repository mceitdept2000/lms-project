import "server-only";

import { supabaseStorage } from "./supabase";
import type { StorageDriver } from "./types";

export const storage: StorageDriver = supabaseStorage;

/** Returns `thumbnailPath` if it belongs to `kind` and exists in storage, otherwise undefined. */
export async function resolveThumbnailPath(
  kind: string,
  thumbnailPath: string | undefined,
): Promise<string | undefined> {
  if (!thumbnailPath?.startsWith(`${kind}/`)) return undefined;
  return (await storage.exists(thumbnailPath)) ? thumbnailPath : undefined;
}
