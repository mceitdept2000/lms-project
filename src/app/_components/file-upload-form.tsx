"use client";

import { useState } from "react";

import {
  ALL_UNITS,
  ALLOWED_MIME_TYPES,
  FILE_KINDS,
  UNITS,
  type AllowedMimeType,
  type FileKind,
} from "~/lib/constants";
import { api } from "~/trpc/react";

export function FileUploadForm() {
  const { data: subjects } = api.subject.list.useQuery();
  const { data: exams } = api.exam.list.useQuery();

  const [kind, setKind] = useState<FileKind>("notes");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState<string>(ALL_UNITS);
  const [subjectId, setSubjectId] = useState("");
  const [examId, setExamId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
    try {
      const form = new FormData();
      form.set("file", file);
      form.set("kind", kind);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const body = (await res.json()) as {
        storagePath?: string;
        error?: string;
      };
      if (!res.ok || !body.storagePath) {
        throw new Error(body.error ?? "Upload failed");
      }

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
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex max-w-md flex-col gap-3">
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
        <select
          className="border-accent rounded-[8px] border px-3 py-2"
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          required
        >
          <option value="">Select subject</option>
          {subjects?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.code} - {s.longName}
            </option>
          ))}
        </select>
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
          <select
            className="border-accent rounded-[8px] border px-3 py-2"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            required
          >
            <option value="">Select exam</option>
            {exams?.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.code} - {exam.name}
              </option>
            ))}
          </select>
        </label>
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
  );
}
