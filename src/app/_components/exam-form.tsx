"use client";

import { useMemo, useState } from "react";

import { EXAM_TYPE_LABELS, EXAM_TYPES, type ExamType } from "~/lib/constants";
import { examNameFromCode, normalizeExamCode } from "~/lib/normalization";
import { api } from "~/trpc/react";

export function ExamForm() {
  const utils = api.useUtils();
  const { data: exams } = api.exam.list.useQuery();

  const [code, setCode] = useState("");
  const [type, setType] = useState<ExamType>(EXAM_TYPES[0]);
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewName = useMemo(
    () => examNameFromCode(normalizeExamCode(code), type),
    [code, type],
  );
  const name = nameOverride ?? previewName ?? "";

  const createExam = api.exam.create.useMutation({
    onSuccess: async () => {
      setCode("");
      setNameOverride(null);
      setError(null);
      await utils.exam.list.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const deleteExam = api.exam.delete.useMutation({
    onSuccess: () => utils.exam.list.invalidate(),
  });

  function onDelete(exam: NonNullable<typeof exams>[number]) {
    const count = exam._count.questionPapers;
    const warning = count
      ? `This will also permanently delete ${count} question paper(s) attached to ${exam.code}.`
      : `Delete ${exam.code}?`;
    if (window.confirm(`${warning} This cannot be undone.`)) {
      deleteExam.mutate({ id: exam.id });
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-8">
      <form
        className="border-accent flex flex-col gap-3 rounded-[8px] border p-4"
        onSubmit={(e) => {
          e.preventDefault();
          createExam.mutate({ code, type, name: name || undefined });
        }}
      >
        <h2 className="font-semibold">Create exam</h2>
        <label className="flex flex-col gap-1 text-sm">
          Type
          <select
            className="border-accent rounded-[8px] border px-3 py-2"
            value={type}
            onChange={(e) => setType(e.target.value as ExamType)}
          >
            {EXAM_TYPES.map((t) => (
              <option key={t} value={t}>
                {EXAM_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Code
          <input
            className="border-accent rounded-[8px] border px-3 py-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="AM2024, AM2024-IAT1, AM2024-A1"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Name (auto-generated, editable)
          <input
            className="border-accent rounded-[8px] border px-3 py-2"
            value={name}
            onChange={(e) => setNameOverride(e.target.value)}
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={createExam.isPending}
          className="bg-primary text-secondary self-start rounded-[8px] px-4 py-2 font-semibold disabled:opacity-50"
        >
          {createExam.isPending ? "Creating..." : "Create exam"}
        </button>
      </form>

      <table className="w-full text-left text-sm">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Type</th>
            <th>Papers</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {exams?.map((exam) => (
            <tr key={exam.id} data-exam-id={exam.id}>
              <td>{exam.code}</td>
              <td>{exam.name}</td>
              <td>{EXAM_TYPE_LABELS[exam.type]}</td>
              <td>{exam._count.questionPapers}</td>
              <td>
                <button
                  type="button"
                  className="text-sm text-red-600 underline"
                  disabled={deleteExam.isPending}
                  onClick={() => onDelete(exam)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
