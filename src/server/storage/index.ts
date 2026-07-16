import "server-only";

import { localStorage } from "./local";
import type { StorageDriver } from "./types";

// Local disk for now; a Cloudflare R2 / S3 driver can be swapped in here
// without touching any callers.
export const storage: StorageDriver = localStorage;
