import { randomUUID } from "node:crypto";

import { z } from "zod";

import { ALLOWED_MIME_TYPES, FILE_KINDS, MIME_TO_EXT } from "~/lib/constants";
import { createTRPCRouter, uploadProcedure } from "~/server/api/trpc";
import { storage } from "~/server/storage";

export const uploadRouter = createTRPCRouter({
  createSignedUrl: uploadProcedure
    .input(
      z.object({
        kind: z.enum(FILE_KINDS),
        contentType: z.enum(ALLOWED_MIME_TYPES),
      }),
    )
    .mutation(async ({ input }) => {
      const key = `${input.kind}/${randomUUID()}.${MIME_TO_EXT[input.contentType]}`;
      const { signedUrl } = await storage.createSignedUploadUrl(key);
      return { key, signedUrl };
    }),
});
