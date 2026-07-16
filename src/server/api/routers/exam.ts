import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { EXAM_TYPES } from "~/lib/constants";
import {
  examNameFromCode,
  normalizeExamCode,
  validateExamCode,
} from "~/lib/normalization";
import {
  createTRPCRouter,
  manageCatalogProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { storage } from "~/server/storage";

export const examRouter = createTRPCRouter({
  list: publicProcedure.query(({ ctx }) =>
    ctx.db.exam.findMany({
      orderBy: { code: "asc" },
      include: { _count: { select: { questionPapers: true } } },
    }),
  ),

  create: manageCatalogProcedure
    .input(
      z.object({
        code: z.string().min(1),
        type: z.enum(EXAM_TYPES),
        name: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const code = normalizeExamCode(input.code);
      if (!validateExamCode(code, input.type)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `"${code}" does not match the expected format for a ${input.type} exam code.`,
        });
      }

      const existing = await ctx.db.exam.findUnique({ where: { code } });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Exam code ${code} already exists.`,
        });
      }

      const name = input.name?.trim() ?? examNameFromCode(code, input.type);
      if (!name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Could not derive an exam name from the given code.",
        });
      }

      return ctx.db.exam.create({
        data: { code, type: input.type, name },
      });
    }),

  delete: manageCatalogProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const questionPapers = await ctx.db.questionPaper.findMany({
        where: { examId: input.id },
        select: { storagePath: true },
      });

      await ctx.db.$transaction([
        ctx.db.questionPaper.deleteMany({ where: { examId: input.id } }),
        ctx.db.exam.delete({ where: { id: input.id } }),
      ]);

      await Promise.all(
        questionPapers.map((q) => storage.delete(q.storagePath)),
      );
    }),
});
