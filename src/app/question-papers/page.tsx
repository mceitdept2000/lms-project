import { Suspense } from "react";

import { QuestionPapersBrowser } from "~/app/_components/question-papers-browser";

export default function QuestionPapersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-primary mb-4 text-xl font-bold">Question Papers</h1>
      <Suspense fallback={<p className="text-sm">Loading...</p>}>
        <QuestionPapersBrowser />
      </Suspense>
    </main>
  );
}
