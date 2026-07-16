import { z } from "zod";

import { PERMISSION_VALUES } from "~/lib/constants";
import { createTRPCRouter, manageUsersProcedure } from "~/server/api/trpc";
import {
  createUserWithPassword,
  setUserPassword,
} from "~/server/better-auth/users";

export const userRouter = createTRPCRouter({
  list: manageUsersProcedure.query(({ ctx }) =>
    ctx.db.user.findMany({
      select: { id: true, username: true, permissions: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ),

  create: manageUsersProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3)
          .max(30)
          .regex(/^[a-zA-Z0-9_.-]+$/),
        password: z.string().min(8),
        permissions: z.array(z.enum(PERMISSION_VALUES)),
      }),
    )
    .mutation(({ input }) => createUserWithPassword(input)),

  setPassword: manageUsersProcedure
    .input(z.object({ userId: z.string(), password: z.string().min(8) }))
    .mutation(async ({ input }) => {
      await setUserPassword(input.userId, input.password);
    }),

  setPermissions: manageUsersProcedure
    .input(
      z.object({
        userId: z.string(),
        permissions: z.array(z.enum(PERMISSION_VALUES)),
      }),
    )
    .mutation(async ({ ctx, input }) =>
      ctx.db.user.update({
        where: { id: input.userId },
        data: { permissions: input.permissions },
      }),
    ),
});
