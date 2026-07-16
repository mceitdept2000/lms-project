import type { Permission } from "~/lib/constants";
import { auth } from "./config";

interface CreateUserInput {
  username: string;
  password: string;
  permissions: Permission[];
}

/**
 * Signup is disabled (emailAndPassword.disableSignUp), so admin-created
 * users are provisioned directly through Better Auth's internal adapter.
 */
export async function createUserWithPassword({
  username,
  password,
  permissions,
}: CreateUserInput) {
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);

  const user = await ctx.internalAdapter.createUser({
    email: `${username}@lms.local`,
    emailVerified: true,
    name: username,
    username,
    displayUsername: username,
    permissions,
  });

  await ctx.internalAdapter.createAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hash,
  });

  return user;
}

export async function setUserPassword(userId: string, password: string) {
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(password);
  await ctx.internalAdapter.updatePassword(userId, hash);
}
