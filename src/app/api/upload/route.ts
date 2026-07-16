import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  ALLOWED_MIME_TYPES,
  FILE_KINDS,
  MIME_TO_EXT,
  type AllowedMimeType,
  type FileKind,
} from "~/lib/constants";
import { auth } from "~/server/better-auth";
import { storage } from "~/server/storage";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!session.user.permissions.includes("UPLOAD_FILES")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const kind = form.get("kind");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (typeof kind !== "string" || !FILE_KINDS.includes(kind as FileKind)) {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return NextResponse.json(
      { error: "Unsupported file type" },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty" }, { status: 400 });
  }

  const ext = MIME_TO_EXT[file.type as AllowedMimeType];
  const key = `${kind}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await storage.put(key, buffer, file.type);

  return NextResponse.json({ storagePath: key });
}
