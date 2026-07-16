"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import { Combobox } from "~/app/_components/ui/combobox";
import { Modal } from "~/app/_components/ui/modal";
import { ProgressBar } from "~/app/_components/ui/progress-bar";
import { env } from "~/env";
import {
  ALL_UNITS,
  ALLOWED_MIME_TYPES,
  FILE_KINDS,
  UNITS,
  type AllowedMimeType,
  type FileKind,
} from "~/lib/constants";
import { api } from "~/trpc/react";

/** Uploads straight to Supabase Storage via a short-lived signed URL, bypassing the app server. */
function uploadToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress: (percent: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("apikey", env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader(
      "Authorization",
      `Bearer ${env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
    );
    xhr.setRequestHeader("content-type", file.type);
    xhr.setRequestHeader("cache-control", "max-age=3600");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

export function FileUploadForm() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();

  const { data: subjects, isLoading: subjectsLoading } =
    api.subject.list.useQuery();
  const { data: exams, isLoading: examsLoading } = api.exam.list.useQuery();

  const [kind, setKind] = useState<FileKind>("notes");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState<string>(ALL_UNITS);
  const [subjectId, setSubjectId] = useState("");
  const [examId, setExamId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState(0);

  const createSignedUrl = api.upload.createSignedUrl.useMutation();
  const createNote = api.note.create.useMutation({
    onSuccess: () => utils.note.list.invalidate(),
  });
  const createQuestionPaper = api.questionPaper.create.useMutation({
    onSuccess: () => utils.questionPaper.list.invalidate(),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Choose a file.");
      return;
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
      setError("File must be a PDF or Word document.");
      return;
    }
    if (file.size === 0) {
      setError("File is empty.");
      return;
    }
    if (!subjectId) {
      setError("Select a subject.");
      return;
    }
    if (kind === "question-papers" && !examId) {
      setError("Select an exam.");
      return;
    }

    setPending(true);
    setProgress(0);
    try {
      const { key, signedUrl } = await createSignedUrl.mutateAsync({
        kind,
        contentType: file.type as AllowedMimeType,
      });
      await uploadToSignedUrl(signedUrl, file, setProgress);

      if (kind === "notes") {
        await createNote.mutateAsync({
          title,
          subjectId,
          unit: unit as (typeof UNITS)[number] | typeof ALL_UNITS,
          storagePath: key,
        });
      } else {
        await createQuestionPaper.mutateAsync({
          subjectId,
          examId,
          storagePath: key,
        });
      }

      setSuccess("Uploaded.");
      setFile(null);
      setTitle("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPending(false);
      setProgress(0);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-primary text-secondary mt-4 inline-flex items-center gap-2 self-start rounded-[8px] px-4 py-2 font-semibold"
      >
        <Upload size={16} aria-hidden="true" />
        Upload file
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Upload file">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <fieldset className="flex gap-4 text-sm">
            {FILE_KINDS.map((k) => (
              <label key={k} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={kind === k}
                  onChange={() => setKind(k)}
                />
                {k === "notes" ? "Notes" : "Question Paper"}
              </label>
            ))}
          </fieldset>

          <label className="flex flex-col gap-1 text-sm">
            File
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
          </label>

          {kind === "notes" && (
            <label className="flex flex-col gap-1 text-sm">
              Title
              <input
                className="border-accent rounded-[8px] border px-3 py-2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </label>
          )}

          <label className="flex flex-col gap-1 text-sm">
            Subject
            <Combobox
              value={subjectId}
              onChange={setSubjectId}
              loading={subjectsLoading}
              placeholder="Search subjects..."
              options={(subjects ?? []).map((s) => ({
                value: s.id,
                label: `${s.code} - ${s.longName}`,
              }))}
            />
          </label>

          {kind === "notes" ? (
            <label className="flex flex-col gap-1 text-sm">
              Unit
              <select
                className="border-accent rounded-[8px] border px-3 py-2"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value={ALL_UNITS}>All units</option>
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    Unit {u}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="flex flex-col gap-1 text-sm">
              Exam
              <Combobox
                value={examId}
                onChange={setExamId}
                loading={examsLoading}
                placeholder="Search exams..."
                options={(exams ?? []).map((exam) => ({
                  value: exam.id,
                  label: `${exam.code} - ${exam.name}`,
                }))}
              />
            </label>
          )}

          {pending && (
            <ProgressBar
              value={progress}
              label={
                progress < 100 ? `Uploading... ${progress}%` : "Finishing up..."
              }
            />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-700">{success}</p>}
          <button
            type="submit"
            disabled={pending}
            className="bg-primary text-secondary self-start rounded-[8px] px-4 py-2 font-semibold disabled:opacity-50"
          >
            {pending ? "Uploading..." : "Upload"}
          </button>
        </form>
      </Modal>
    </>
  );
}
