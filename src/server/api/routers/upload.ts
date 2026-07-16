import { randomUUID } from "node:crypto";

import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ALLOWED_MIME_TYPES, FILE_KINDS, MIME_TO_EXT } from "~/lib/constants";
import {
  createTRPCRouter,
  protectedProcedure,
  uploadProcedure,
} from "~/server/api/trpc";
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
      const uuid = randomUUID();
      const key = `${input.kind}/${uuid}.${MIME_TO_EXT[input.contentType]}`;

      if (input.contentType !== "application/pdf") {
        const { signedUrl } = await storage.createSignedUploadUrl(key);
        return { key, signedUrl };
      }

      const thumbnailKey = `${input.kind}/${uuid}.png`;
      const [{ signedUrl }, { signedUrl: thumbnailSignedUrl }] =
        await Promise.all([
          storage.createSignedUploadUrl(key),
          storage.createSignedUploadUrl(thumbnailKey),
        ]);
      return {
        key,
        signedUrl,
        thumbnail: { key: thumbnailKey, signedUrl: thumbnailSignedUrl },
      };
    }),

  /** Mints a thumbnail upload slot for a PDF that was uploaded before thumbnails existed. */
  requestThumbnailUploadUrl: protectedProcedure
    .input(
      z.object({
        kind: z.enum(FILE_KINDS),
        storagePath: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const match = new RegExp(`^${input.kind}/([0-9a-f-]{36})\\.pdf$`).exec(
        input.storagePath,
      );
      if (!match) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only PDFs can have thumbnails.",
        });
      }

      const key = `${input.kind}/${match[1]}.png`;

      // A thumbnail can already exist in storage without the DB knowing about it
      // (e.g. a prior setThumbnail call was interrupted) — createSignedUploadUrl
      // refuses to mint a URL for a key that already exists, so detect that case
      // and tell the client there's nothing left to upload.
      if (await storage.exists(key)) {
        return { key, signedUrl: null };
      }

      const { signedUrl } = await storage.createSignedUploadUrl(key);
      return { key, signedUrl };
    }),
});
