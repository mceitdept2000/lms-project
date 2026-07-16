import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  REGULATIONS,
} from "~/lib/constants";
import {
  createTRPCRouter,
  publicProcedure,
  uploadProcedure,
} from "~/server/api/trpc";
import { storage } from "~/server/storage";

export const questionPaperRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().trim().optional(),
        regulation: z.enum(REGULATIONS).optional(),
        examCode: z.string().optional(),
        subjectCode: z.string().optional(),
        sortBy: z.enum(["createdAt"]).default("createdAt"),
        sortDir: z.enum(["asc", "desc"]).default("desc"),
        page: z.number().int().min(1).default(1),
        pageSize: z
          .number()
          .refine((v) => (PAGE_SIZE_OPTIONS as readonly number[]).includes(v))
          .default(DEFAULT_PAGE_SIZE),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where = {
        deletedAt: null,
        ...(input.search
          ? {
              OR: [
                {
                  exam: {
                    name: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                },
                {
                  exam: {
                    code: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                },
                {
                  subject: {
                    longName: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                },
                {
                  subject: {
                    shortName: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                },
                {
                  subject: {
                    code: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              ],
            }
          : {}),
        ...(input.regulation
          ? { subject: { regulation: input.regulation } }
          : {}),
        ...(input.examCode ? { exam: { code: input.examCode } } : {}),
        ...(input.subjectCode ? { subject: { code: input.subjectCode } } : {}),
      };

      const [total, items] = await ctx.db.$transaction([
        ctx.db.questionPaper.count({ where }),
        ctx.db.questionPaper.findMany({
          where,
          orderBy: { [input.sortBy]: input.sortDir },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          include: {
            subject: {
              select: { shortName: true, code: true, regulation: true },
            },
            exam: { select: { name: true, code: true, type: true } },
          },
        }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  create: uploadProcedure
    .input(
      z.object({
        subjectId: z.string(),
        examId: z.string(),
        storagePath: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.storagePath.startsWith("question-papers/")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid storage path.",
        });
      }
      if (!(await storage.exists(input.storagePath))) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "File was not uploaded.",
        });
      }
      return ctx.db.questionPaper.create({ data: input });
    }),

  softDelete: uploadProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.questionPaper.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      }),
    ),
});
