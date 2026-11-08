import { z } from "zod";

export const createBlogSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot more than 100 characters"),
  body: z.string().min(3, "Title must be at least 3 characters"),
});

export type CreateBlogInput = z.infer<typeof createBlogSchema>;

const blogStatus = z.enum(["draft", "published"]);

export const updateBlogSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot more than 100 characters")
    .optional(),

  body: z.string().min(3, "Title must be at least 3 characters").optional(),

  status: blogStatus.optional(),
});

export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
