"use client";

import { ClipboardList, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { DataTable, type DataTableColumn } from "~/app/_components/data-table";
import { Modal } from "~/app/_components/ui/modal";
import { EXAM_TYPE_LABELS, EXAM_TYPES, type ExamType } from "~/lib/constants";
import { examNameFromCode, normalizeExamCode } from "~/lib/normalization";
import { type RouterOutputs, api } from "~/trpc/react";

type ExamRow = RouterOutputs["exam"]["list"][number];

export function ExamForm() {
  const utils = api.useUtils();
  const { data: exams, isLoading } = api.exam.list.useQuery();

  const [open, setOpen] = useState(false);
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
      setOpen(false);
      await utils.exam.list.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const deleteExam = api.exam.delete.useMutation({
    onSuccess: () => utils.exam.list.invalidate(),
  });

  function onDelete(exam: ExamRow) {
    const count = exam._count.questionPapers;
    const warning = count
      ? `This will also permanently delete ${count} question paper(s) attached to ${exam.code}.`
      : `Delete ${exam.code}?`;
    if (window.confirm(`${warning} This cannot be undone.`)) {
      deleteExam.mutate({ id: exam.id });
    }
  }

  const columns: DataTableColumn<ExamRow>[] = [
    { header: "Code", cell: (exam) => exam.code },
    { header: "Name", cell: (exam) => exam.name },
    { header: "Type", cell: (exam) => EXAM_TYPE_LABELS[exam.type] },
    { header: "Papers", cell: (exam) => exam._count.questionPapers },
    {
      header: "",
      cell: (exam) => (
        <button
          type="button"
          className="text-sm text-red-600 underline"
          disabled={deleteExam.isPending}
          onClick={() => onDelete(exam)}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="mt-4 flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-primary text-secondary inline-flex items-center gap-2 self-start rounded-[8px] px-4 py-2 font-semibold"
      >
        <Plus size={16} aria-hidden="true" />
        Add exam
      </button>

      <DataTable
        columns={columns}
        rows={exams ?? []}
        isLoading={isLoading}
        loadingLabel="Loading exams..."
        emptyIcon={ClipboardList}
        emptyTitle="No exams yet"
        emptyDescription="Create an exam to get started."
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Create exam">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createExam.mutate({ code, type, name: name || undefined });
          }}
        >
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
      </Modal>
    </div>
  );
}
