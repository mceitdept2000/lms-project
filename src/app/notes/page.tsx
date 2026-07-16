import { Suspense } from "react";

import { NotesBrowser } from "~/app/_components/notes-browser";

export default function NotesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-primary mb-4 text-xl font-bold">Notes</h1>
      <Suspense fallback={<p className="text-sm">Loading...</p>}>
        <NotesBrowser />
      </Suspense>
    </main>
  );
}
