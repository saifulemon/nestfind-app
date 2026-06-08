import * as z from 'zod';

export const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().max(200, 'Title must be less than 200 characters').optional(),
  comment: z.string().min(3, 'Comment must be at least 3 characters').max(2000, 'Comment must be less than 2000 characters'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
