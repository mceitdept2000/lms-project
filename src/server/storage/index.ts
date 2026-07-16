import "server-only";

import { supabaseStorage } from "./supabase";
import type { StorageDriver } from "./types";

export const storage: StorageDriver = supabaseStorage;
