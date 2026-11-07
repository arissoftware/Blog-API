import { email, z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Full Name must be at least 3 characters")
    .max(150, "Full Name cannot exceed 150 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Please provide a valid Email address.")),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(150, "Password cannot exceed 150 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const updateUserSchema = registerSchema
  .omit({ password: true })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userLoginSchema = z.object({
  email: z.email("Please provide a valid Email address"),

  password: z.string().min(1, "Password is required"),
});

export type LoginUserInput = z.infer<typeof userLoginSchema>;
