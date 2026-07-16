import "server-only";

import { createReadStream } from "node:fs";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { env } from "~/env";
import type { StorageDriver } from "./types";

const KEY_PATTERN = /^(notes|question-papers)\/[0-9a-f-]{36}\.(pdf|docx|doc)$/;

const root = path.resolve(env.UPLOADS_DIR);

function resolveKey(key: string): string {
  if (!KEY_PATTERN.test(key)) {
    throw new Error(`Invalid storage key: ${key}`);
  }
  const resolved = path.resolve(root, key);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error(`Storage key escapes upload root: ${key}`);
  }
  return resolved;
}

export const localStorage: StorageDriver = {
  async put(key, data) {
    const filePath = resolveKey(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, data);
  },

  async get(key) {
    const filePath = resolveKey(key);
    let size: number;
    try {
      size = (await stat(filePath)).size;
    } catch {
      return null;
    }
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
    return { stream, size };
  },

  async delete(key) {
    const filePath = resolveKey(key);
    await unlink(filePath).catch(() => undefined);
  },

  async exists(key) {
    try {
      await stat(resolveKey(key));
      return true;
    } catch {
      return false;
    }
  },
};
