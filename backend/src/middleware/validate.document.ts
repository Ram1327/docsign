import { z } from "zod";

export const uploadDocumentSchema = z.object({
  body: z.object({
    title: z.string().max(200, "Title cannot exceed 200 characters").optional(),
  }),
});

export const listDocumentsSchema = z.object({
  body: z.object({}),
  // query params are validated inline in the controller
});
