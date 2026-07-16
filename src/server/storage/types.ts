export interface StorageDriver {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<{ stream: ReadableStream; size: number } | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
