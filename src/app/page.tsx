import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-24 text-center">
      <h1 className="text-primary text-4xl font-bold">
        MCE LMS Question Papers &amp; Notes
      </h1>
      <p className="max-w-xl text-lg">
        Browse Anna University end-semester question papers, IAT and assignment
        papers, and subject notes.
      </p>
      <div className="flex gap-4">
        <Link
          href="/notes"
          className="bg-primary text-secondary rounded-md px-6 py-3 font-semibold"
        >
          Browse Notes
        </Link>
        <Link
          href="/question-papers"
          className="border-primary text-primary rounded-md border px-6 py-3 font-semibold"
        >
          Browse Question Papers
        </Link>
      </div>
    </main>
  );
}
