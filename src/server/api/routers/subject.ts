import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { REGULATIONS, SEMESTERS, YEARS } from "~/lib/constants";
import { titleCase } from "~/lib/normalization";
import {
  createTRPCRouter,
  manageCatalogProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { storage } from "~/server/storage";

export const subjectRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ regulation: z.enum(REGULATIONS).optional() }).optional())
    .query(({ ctx, input }) =>
      ctx.db.subject.findMany({
        where: input?.regulation ? { regulation: input.regulation } : undefined,
        orderBy: { code: "asc" },
        include: {
          _count: { select: { notes: true, questionPapers: true } },
        },
      }),
    ),

  create: manageCatalogProcedure
    .input(
      z.object({
        code: z.string().min(1),
        longName: z.string().min(1),
        shortName: z.string().min(1),
        year: z.enum(YEARS),
        semester: z.enum(SEMESTERS),
        regulation: z.enum(REGULATIONS),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const code = input.code.trim().toUpperCase();
      const existing = await ctx.db.subject.findUnique({
        where: { code_regulation: { code, regulation: input.regulation } },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Subject ${code} already exists for ${input.regulation}.`,
        });
      }
      return ctx.db.subject.create({
        data: {
          ...input,
          code,
          longName: titleCase(input.longName),
        },
      });
    }),

  delete: manageCatalogProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [notes, questionPapers] = await Promise.all([
        ctx.db.note.findMany({
          where: { subjectId: input.id },
          select: { storagePath: true },
        }),
        ctx.db.questionPaper.findMany({
          where: { subjectId: input.id },
          select: { storagePath: true },
        }),
      ]);

      await ctx.db.$transaction([
        ctx.db.note.deleteMany({ where: { subjectId: input.id } }),
        ctx.db.questionPaper.deleteMany({ where: { subjectId: input.id } }),
        ctx.db.subject.delete({ where: { id: input.id } }),
      ]);

      await Promise.all([
        ...notes.map((n) => storage.delete(n.storagePath)),
        ...questionPapers.map((q) => storage.delete(q.storagePath)),
      ]);
    }),
});
