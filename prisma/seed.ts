import { PERMISSIONS } from "~/lib/constants";
import { createUserWithPassword } from "~/server/better-auth/users";
import { db } from "~/server/db";
import { env } from "~/env";

async function main() {
  const existing = await db.user.findUnique({
    where: { username: env.SEED_ADMIN_USERNAME },
  });
  if (existing) {
    console.log(
      `Admin user "${env.SEED_ADMIN_USERNAME}" already exists, skipping.`,
    );
    return;
  }

  if (!env.SEED_ADMIN_PASSWORD) {
    throw new Error("SEED_ADMIN_PASSWORD must be set to seed the admin user.");
  }

  await createUserWithPassword({
    username: env.SEED_ADMIN_USERNAME,
    password: env.SEED_ADMIN_PASSWORD,
    permissions: [
      PERMISSIONS.UPLOAD_FILES,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.MANAGE_CATALOG,
    ],
  });
  console.log(`Created admin user "${env.SEED_ADMIN_USERNAME}".`);
}

main()
  .catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    void db.$disconnect();
  });
