import { z } from 'zod';

export const searchSchema = z.object({
  photo: z
    .instanceof(File, { message: 'Please upload a photo to search' })
    .refine((f) => f.size <= 5 * 1024 * 1024, 'Max file size is 5MB')
    .refine(
      (f) => ['image/jpeg', 'image/png'].includes(f.type),
      'Only JPEG or PNG images are allowed'
    ),
  threshold: z
    .number()
    .min(0.1, 'Threshold must be at least 0.1')
    .max(1.0, 'Threshold must be at most 1.0')
    .optional()
    .default(0.6),
});

export type SearchFormData = z.infer<typeof searchSchema>;
