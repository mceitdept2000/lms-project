import { NextResponse } from "next/server";

import { db } from "~/server/db";
import { storage } from "~/server/storage";

const KEY_PATTERN =
  /^(notes|question-papers)\/[0-9a-f-]{36}\.(pdf|docx|doc|png)$/;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9 _.-]/g, "_");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key: keyParts } = await params;
  const key = keyParts.join("/");
  if (!KEY_PATTERN.test(key)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = key.split(".").pop()!;
  const [kind] = key.split("/");
  const isThumbnail = ext === "png";
  let filenameBase: string | undefined;

  if (kind === "notes") {
    const note = await db.note.findFirst({
      where: isThumbnail
        ? { thumbnailPath: key, deletedAt: null }
        : { storagePath: key, deletedAt: null },
      select: { title: true },
    });
    if (!note)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    filenameBase = note.title;
  } else {
    const qp = await db.questionPaper.findFirst({
      where: isThumbnail
        ? { thumbnailPath: key, deletedAt: null }
        : { storagePath: key, deletedAt: null },
      select: {
        exam: { select: { code: true } },
        subject: { select: { code: true } },
      },
    });
    if (!qp) return NextResponse.json({ error: "Not found" }, { status: 404 });
    filenameBase = `${qp.subject.code}-${qp.exam.code}`;
  }

  const signedUrl = await storage.createSignedDownloadUrl(
    key,
    isThumbnail ? undefined : `${sanitizeFilename(filenameBase)}.${ext}`,
  );

  return NextResponse.redirect(signedUrl);
}
