import { z } from 'zod';

export const reportSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must be less than 255 characters'),
  age: z
    .number()
    .min(0, 'Age must be 0 or above')
    .max(120, 'Age must be 120 or below')
    .optional()
    .or(z.literal(undefined)),
  date_of_birth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required',
  }),
  last_seen_location: z
    .string()
    .min(3, 'Location must be at least 3 characters')
    .max(500, 'Location must be less than 500 characters'),
  last_seen_date: z.string().min(1, 'Last seen date is required'),
  height: z.string().max(50).optional(),
  weight: z.string().max(50).optional(),
  distinguishing_marks: z.string().optional(),
  reporter_contact: z
    .string()
    .email('A valid email is required'),
  photo: z
    .instanceof(File, { message: 'Photo is required' })
    .refine((f) => f.size <= 5 * 1024 * 1024, 'Max file size is 5MB')
    .refine(
      (f) => ['image/jpeg', 'image/png'].includes(f.type),
      'Only JPEG or PNG images are allowed'
    ),
});

export type ReportFormData = z.infer<typeof reportSchema>;
