import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { SITE } from "@/config";

export const BLOG_PATH = "../posts";
export const EXAMPLES_PATH = "src/data/examples";

const blog = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${BLOG_PATH}` }),
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      slug: z.string(),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image().or(z.string()).optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
      hideEditPost: z.boolean().optional(),
      timezone: z.string().optional(),
      examples: z.array(z.string()).optional(),
    }),
});

const examples = defineCollection({
  loader: glob({ pattern: "**/[^_]*.md", base: `./${EXAMPLES_PATH}` }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      slug: z.string(),
      tags: z.array(z.string()).default([]),
      createdDate: z.date(),
      updatedDate: z.date().optional(),
      repoPath: z.string(),
      githubUrl: z.string().url().optional(),
      postSlugs: z.array(z.string()).optional(),
    }),
});

export const collections = { blog, examples };
