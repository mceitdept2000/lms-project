import { Suspense } from "react";

import { NotesBrowser } from "~/app/_components/notes-browser";
import { LoadingState } from "~/app/_components/ui/loading-state";

export default function NotesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-primary mb-4 text-xl font-bold">Notes</h1>
      <Suspense fallback={<LoadingState label="Loading notes..." />}>
        <NotesBrowser />
      </Suspense>
    </main>
  );
}
