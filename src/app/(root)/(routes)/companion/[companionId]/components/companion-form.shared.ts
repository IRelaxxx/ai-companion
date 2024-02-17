import * as z from 'zod';

// we cannot import zod schemas from a server component into a client component and vice versa
export const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  description: z.string().min(1, {
    message: 'Description is required',
  }),
  instructions: z.string().min(200, {
    message: 'Instructions requires at least 200 characters',
  }),
  seed: z.string().min(200, {
    message: 'Seed requires at least 200 characters',
  }),
  src: z.string().min(1, {
    message: 'Image is required',
  }),
  category: z.string().min(1, {
    message: 'Category is required',
  }),
});

export type CompanionFormValues = z.infer<typeof formSchema>;
