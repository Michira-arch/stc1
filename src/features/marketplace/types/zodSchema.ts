import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .email({ message: "Please provide a valid email" }),
  password: z.string(),
});

export const SignupSchema = z.object({
  email: z
    .string()
    .email({ message: "Please provide a valid email" }),
  name: z
    .string()
    .min(5, { message: "Name must be minimum 5 characters long" }),
  password: z
    .string()
    .min(6, { message: "Password must be minimum 6 characters long" })
    .max(10, { message: "Password must be maximum 10 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/,
      {
        message:
          "Password must contain at least one uppercase('A-Z') letter, one lowercase('a-z') letter, one digit(0-9), and one special character",
      }
    ),
  college: z
    .string()
    .min(5, { message: "College name must be minimum 5 characters long" }),
  phoneNo: z
    .string()
    .min(10, { message: "Phone no. must be minimum 10 digits (e.g. 07... or +254...)" })
    .max(15, { message: "Phone no. must be maximum 15 digits" }),
  image: z.string().optional(), // Image is optional during initial signup
});

export const CreatePostSchema = z.object({
  title: z
    .string()
    .min(4, { message: "Title must be minimum 4 characters long" }),
  description: z
    .string()
    .min(5, { message: "Description must be minimum 5 characters long" }),
  price: z.string(),
  images: z
    .array(z.string())
    .min(1, { message: "At least one image is required." })
    .max(4, { message: "You can upload a maximum of 4 images." }),
  category: z.string(),
});

export const CreateRequestSchema = z.object({
  title: z
    .string()
    .min(4, { message: "Title must be minimum 4 characters long" }),
  description: z
    .string()
    .min(5, { message: "Description must be minimum 5 characters long" }),
  image: z.string(),
});

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (value === undefined || value === null) return true;
        return value.length >= 5;
      },
      {
        message: "Name must be a minimum of 5 characters long.",
      }
    ),
  password: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value) return true;
        return (
          value.length >= 6 &&
          value.length <= 10 &&
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,10}$/.test(
            value
          )
        );
      },
      {
        message:
          "Password must be between 6 and 10 characters long, and include one uppercase letter, one lowercase letter, one digit, and one special character.",
      }
    ),
  phoneNo: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (value === undefined || value === null) return true;
        return value.length >= 10 && value.length <= 15;
      },
      {
        message: "Phone number must be between 10 and 15 digits long.",
      }
    ),
  image: z.string().optional(),
});

export const UpdatePostSchema = z.object({
  title: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (value === undefined || value === null) return true;

        return value.length >= 4;
      },
      { message: "Title must be minimum 4 characters long" }
    ),
  description: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (value === undefined || value === null) return true;

        return value.length >= 5;
      },
      { message: "Description must be minimum 4 characters long" }
    ),
  price: z
    .string()
    .optional()
    .refine((value) => {
      if (value === undefined || value === null) return true;

      return value.length >= 1;
    }),
  category: z.string().optional(),
  images: z
    .array(z.string())
    .optional()
    .refine(
      (value) => {
        if (
          (value && value?.length < 1) ||
          value === undefined ||
          value === null
        )
          return true;

        return value.length >= 1 || value.length <= 5;
      },
      { message: "You can upload a maximum of 4 images." }
    ),
});
