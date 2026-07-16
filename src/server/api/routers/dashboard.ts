import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const dashboardRouter = createTRPCRouter({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [subjects, exams, notes, questionPapers, users] = await Promise.all([
      ctx.db.subject.count(),
      ctx.db.exam.count(),
      ctx.db.note.count({ where: { deletedAt: null } }),
      ctx.db.questionPaper.count({ where: { deletedAt: null } }),
      ctx.session.user.permissions.includes("MANAGE_USERS")
        ? ctx.db.user.count()
        : Promise.resolve(null),
    ]);

    return { subjects, exams, notes, questionPapers, users };
  }),
});
