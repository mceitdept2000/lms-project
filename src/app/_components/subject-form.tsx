"use client";

import { GraduationCap, Plus } from "lucide-react";
import { useState } from "react";

import { DataTable, type DataTableColumn } from "~/app/_components/data-table";
import { Modal } from "~/app/_components/ui/modal";
import {
  REGULATIONS,
  SEMESTERS,
  YEARS,
  type Regulation,
  type Semester,
  type Year,
} from "~/lib/constants";
import { type RouterOutputs, api } from "~/trpc/react";

type SubjectRow = RouterOutputs["subject"]["list"][number];

export function SubjectForm() {
  const utils = api.useUtils();
  const { data: subjects, isLoading } = api.subject.list.useQuery();

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [longName, setLongName] = useState("");
  const [shortName, setShortName] = useState("");
  const [year, setYear] = useState<Year>(YEARS[0]);
  const [semester, setSemester] = useState<Semester>(SEMESTERS[0]);
  const [regulation, setRegulation] = useState<Regulation>(REGULATIONS[0]);
  const [error, setError] = useState<string | null>(null);

  const createSubject = api.subject.create.useMutation({
    onSuccess: async () => {
      setCode("");
      setLongName("");
      setShortName("");
      setError(null);
      setOpen(false);
      await utils.subject.list.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const deleteSubject = api.subject.delete.useMutation({
    onSuccess: () => utils.subject.list.invalidate(),
  });

  function onDelete(subject: SubjectRow) {
    const { notes, questionPapers } = subject._count;
    const warning =
      notes || questionPapers
        ? `This will also permanently delete ${notes} note(s) and ${questionPapers} question paper(s) attached to ${subject.code}.`
        : `Delete ${subject.code}?`;
    if (window.confirm(`${warning} This cannot be undone.`)) {
      deleteSubject.mutate({ id: subject.id });
    }
  }

  const columns: DataTableColumn<SubjectRow>[] = [
    { header: "Code", cell: (s) => s.code },
    { header: "Name", cell: (s) => s.longName },
    { header: "Year", cell: (s) => s.year },
    { header: "Semester", cell: (s) => s.semester },
    { header: "Regulation", cell: (s) => s.regulation },
    {
      header: "Files",
      cell: (s) => `${s._count.notes} notes, ${s._count.questionPapers} papers`,
    },
    {
      header: "",
      cell: (s) => (
        <button
          type="button"
          className="text-sm text-red-600 underline"
          disabled={deleteSubject.isPending}
          onClick={() => onDelete(s)}
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
        Add subject
      </button>

      <DataTable
        columns={columns}
        rows={subjects ?? []}
        isLoading={isLoading}
        loadingLabel="Loading subjects..."
        emptyIcon={GraduationCap}
        emptyTitle="No subjects yet"
        emptyDescription="Create a subject to get started."
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Create subject">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            createSubject.mutate({
              code,
              longName,
              shortName,
              year,
              semester,
              regulation,
            });
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            Code
            <input
              className="border-accent rounded-[8px] border px-3 py-2"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Long name
            <input
              className="border-accent rounded-[8px] border px-3 py-2"
              value={longName}
              onChange={(e) => setLongName(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Short name
            <input
              className="border-accent rounded-[8px] border px-3 py-2"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              required
            />
          </label>
          <div className="flex gap-3">
            <label className="flex flex-col gap-1 text-sm">
              Year
              <select
                className="border-accent rounded-[8px] border px-3 py-2"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value as (typeof YEARS)[number])
                }
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Semester
              <select
                className="border-accent rounded-[8px] border px-3 py-2"
                value={semester}
                onChange={(e) =>
                  setSemester(e.target.value as (typeof SEMESTERS)[number])
                }
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Regulation
              <select
                className="border-accent rounded-[8px] border px-3 py-2"
                value={regulation}
                onChange={(e) =>
                  setRegulation(e.target.value as (typeof REGULATIONS)[number])
                }
              >
                {REGULATIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={createSubject.isPending}
            className="bg-primary text-secondary self-start rounded-[8px] px-4 py-2 font-semibold disabled:opacity-50"
          >
            {createSubject.isPending ? "Creating..." : "Create subject"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
