"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import { Combobox } from "~/app/_components/ui/combobox";
import { Modal } from "~/app/_components/ui/modal";
import { ProgressBar } from "~/app/_components/ui/progress-bar";
import {
  ALL_UNITS,
  ALLOWED_MIME_TYPES,
  FILE_KINDS,
  UNITS,
  type AllowedMimeType,
  type FileKind,
} from "~/lib/constants";
import { api } from "~/trpc/react";

function uploadFile(
  file: File,
  kind: FileKind,
  onProgress: (percent: number) => void,
) {
  return new Promise<{ storagePath: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      let body: { storagePath?: string; error?: string } = {};
      try {
        body = JSON.parse(xhr.responseText) as typeof body;
      } catch {
        // ignore malformed response body, handled by the status/storagePath check below
      }
      if (xhr.status >= 200 && xhr.status < 300 && body.storagePath) {
        resolve({ storagePath: body.storagePath });
      } else {
        reject(new Error(body.error ?? "Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    const form = new FormData();
    form.set("file", file);
    form.set("kind", kind);
    xhr.send(form);
  });
}

export function FileUploadForm() {
  const [open, setOpen] = useState(false);

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

  const createNote = api.note.create.useMutation();
  const createQuestionPaper = api.questionPaper.create.useMutation();

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
      const body = await uploadFile(file, kind, setProgress);

      if (kind === "notes") {
        await createNote.mutateAsync({
          title,
          subjectId,
          unit: unit as (typeof UNITS)[number] | typeof ALL_UNITS,
          storagePath: body.storagePath,
        });
      } else {
        await createQuestionPaper.mutateAsync({
          subjectId,
          examId,
          storagePath: body.storagePath,
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
                progress < 100
                  ? `Uploading... ${progress}%`
                  : "Finishing up..."
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
