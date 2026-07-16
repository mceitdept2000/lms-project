import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  ALL_UNITS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  SEMESTERS,
  UNITS,
  YEARS,
} from "~/lib/constants";
import {
  createTRPCRouter,
  publicProcedure,
  uploadProcedure,
} from "~/server/api/trpc";
import { storage } from "~/server/storage";

export const noteRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z.object({
        search: z.string().trim().optional(),
        semester: z.enum(SEMESTERS).optional(),
        year: z.enum(YEARS).optional(),
        subjectId: z.string().optional(),
        sortBy: z.enum(["createdAt", "title"]).default("createdAt"),
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
                  title: {
                    contains: input.search,
                    mode: "insensitive" as const,
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
                    longName: {
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
        subject: {
          ...(input.semester ? { semester: input.semester } : {}),
          ...(input.year ? { year: input.year } : {}),
        },
        ...(input.subjectId ? { subjectId: input.subjectId } : {}),
      };

      const [total, items] = await ctx.db.$transaction([
        ctx.db.note.count({ where }),
        ctx.db.note.findMany({
          where,
          orderBy: { [input.sortBy]: input.sortDir },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
          include: {
            subject: {
              select: {
                shortName: true,
                code: true,
                semester: true,
                year: true,
              },
            },
          },
        }),
      ]);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  create: uploadProcedure
    .input(
      z.object({
        title: z.string().min(1),
        subjectId: z.string(),
        unit: z.enum([...UNITS, ALL_UNITS]).optional(),
        storagePath: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.storagePath.startsWith("notes/")) {
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
      return ctx.db.note.create({ data: input });
    }),

  softDelete: uploadProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.db.note.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      }),
    ),
});
