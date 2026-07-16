export interface StorageDriver {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<{ stream: ReadableStream; size: number } | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  /** Short-lived URL + token the browser can upload directly to, bypassing the app server. */
  createSignedUploadUrl(key: string): Promise<{ signedUrl: string; token: string }>;
}
