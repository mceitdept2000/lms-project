import { dashboardRouter } from "~/server/api/routers/dashboard";
import { examRouter } from "~/server/api/routers/exam";
import { noteRouter } from "~/server/api/routers/note";
import { questionPaperRouter } from "~/server/api/routers/questionPaper";
import { subjectRouter } from "~/server/api/routers/subject";
import { uploadRouter } from "~/server/api/routers/upload";
import { userRouter } from "~/server/api/routers/user";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  subject: subjectRouter,
  exam: examRouter,
  note: noteRouter,
  questionPaper: questionPaperRouter,
  dashboard: dashboardRouter,
  upload: uploadRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = createCallerFactory(appRouter);
