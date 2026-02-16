import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { z } from "astro/zod";

const blogSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  pubDatetime: z.coerce.date(),
  modDatetime: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().optional(),
  canonicalURL: z.string().url().optional(),
  examples: z.array(z.string()).optional(),
});

const exampleSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  createdDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  repoPath: z.string(),
  githubUrl: z.string().url().optional(),
  postSlugs: z.array(z.string()).optional(),
});

function collectMdFiles(dir: string): string[] {
  const files: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        files.push(...collectMdFiles(full));
      } else if (entry.endsWith(".md")) {
        files.push(full);
      }
    }
  } catch {
    // Directory doesn't exist — that's fine
  }
  return files;
}

function parseFrontmatter(content: string): Record<string, unknown> | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result: Record<string, unknown> = {};

  for (const line of yaml.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value: unknown = line.slice(colonIdx + 1).trim();

    // Remove quotes
    if (
      typeof value === "string" &&
      value.startsWith('"') &&
      value.endsWith('"')
    ) {
      value = value.slice(1, -1);
    }

    // Handle arrays (simple inline form: [a, b, c])
    if (
      typeof value === "string" &&
      value.startsWith("[") &&
      value.endsWith("]")
    ) {
      value = value
        .slice(1, -1)
        .split(",")
        .map(s => s.trim().replace(/^["']|["']$/g, ""));
    }

    // Handle booleans
    if (value === "true") value = true;
    if (value === "false") value = false;

    if (key) result[key] = value;
  }

  return result;
}

let hasErrors = false;
const siteDir = join(import.meta.dirname, "..");
const repoRoot = join(siteDir, "..");

const collections: { name: string; dir: string; schema: z.ZodType }[] = [
  { name: "blog", dir: join(repoRoot, "posts"), schema: blogSchema },
  { name: "examples", dir: join(siteDir, "src", "data", "examples"), schema: exampleSchema },
];

for (const { name, dir, schema } of collections) {
  const files = collectMdFiles(dir);
  console.log(`\nValidating ${name}: ${files.length} file(s)`);

  for (const file of files) {
    const content = readFileSync(file, "utf-8");
    const frontmatter = parseFrontmatter(content);
    const relPath = relative(process.cwd(), file);

    if (!frontmatter) {
      console.error(`  FAIL ${relPath}: No front matter found`);
      hasErrors = true;
      continue;
    }

    const result = schema.safeParse(frontmatter);
    if (!result.success) {
      console.error(`  FAIL ${relPath}:`);
      for (const issue of result.error.issues) {
        console.error(`    - ${issue.path.join(".")}: ${issue.message}`);
      }
      hasErrors = true;
    } else {
      console.log(`  OK   ${relPath}`);
    }
  }
}

if (hasErrors) {
  console.error("\nValidation failed.");
  process.exit(1);
} else {
  console.log("\nAll front matter valid.");
}
