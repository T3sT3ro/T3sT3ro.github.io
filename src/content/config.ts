import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    draft: z.boolean().optional().default(true),
    published: z
      .string().datetime({offset: true})
      .or(z.date())
      // Transform string to Date object
      .transform((val) => new Date(val)),
    modified: z
      .string().datetime({offset: true})
      .or(z.date())
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
  })
});

export const collections = {
  'blog': blogCollection
};
