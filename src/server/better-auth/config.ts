import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";

import { db } from "~/server/db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  plugins: [username()],
  user: {
    additionalFields: {
      permissions: {
        type: "string[]",
        defaultValue: [],
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
