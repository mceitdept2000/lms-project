import "server-only";

import { createClient } from "@supabase/supabase-js";

import { env } from "~/env";
import type { StorageDriver } from "./types";

const client = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const bucket = client.storage.from(env.SUPABASE_STORAGE_BUCKET);

export const supabaseStorage: StorageDriver = {
  async put(key, data, contentType) {
    const { error } = await bucket.upload(key, data, {
      contentType,
      upsert: false,
    });
    if (error) throw error;
  },

  async get(key) {
    const { data, error } = await bucket.download(key);
    if (error || !data) return null;
    return { stream: data.stream(), size: data.size };
  },

  async delete(key) {
    await bucket.remove([key]);
  },

  async exists(key) {
    const { data } = await bucket.exists(key);
    return data;
  },

  async createSignedUploadUrl(key) {
    const { data, error } = await bucket.createSignedUploadUrl(key);
    if (error) throw error;
    return { signedUrl: data.signedUrl, token: data.token };
  },
};
