import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_DIR = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(SITE_DIR, "..");

const DEVTO_MD = path.join(
  REPO_ROOT,
  "posts/from-sqslistener-to-your-method/_devto.md"
);

async function loadApiKey(): Promise<string> {
  if (process.env.DEV_TO_API_KEY) return process.env.DEV_TO_API_KEY;

  const envLocal = path.join(SITE_DIR, ".env.local");
  try {
    const contents = await fs.readFile(envLocal, "utf8");
    const m = contents.match(/^DEV_TO_API_KEY=(.+)$/m);
    if (m) return m[1].trim();
  } catch {
    // fall through
  }

  throw new Error(
    "DEV_TO_API_KEY not set. Export it, or put it in site/.env.local"
  );
}

const apiKey = await loadApiKey();
const bodyMarkdown = await fs.readFile(DEVTO_MD, "utf8");

console.log(`Posting ${path.relative(REPO_ROOT, DEVTO_MD)} to dev.to as draft...`);

const res = await fetch("https://dev.to/api/articles", {
  method: "POST",
  headers: {
    "api-key": apiKey,
    "Content-Type": "application/json",
    Accept: "application/vnd.forem.api-v1+json",
  },
  body: JSON.stringify({
    article: {
      body_markdown: bodyMarkdown,
    },
  }),
});

const text = await res.text();
if (!res.ok) {
  console.error(`\nHTTP ${res.status} ${res.statusText}`);
  console.error(text);
  process.exit(1);
}

const data = JSON.parse(text);

const tags = Array.isArray(data.tag_list)
  ? data.tag_list.join(", ")
  : typeof data.tag_list === "string"
    ? data.tag_list
    : "(none)";

console.log("\nSuccess.");
console.log(`  id:         ${data.id}`);
console.log(`  title:      ${data.title}`);
console.log(`  published:  ${data.published ?? false}`);
console.log(`  tags:       ${tags}`);
console.log(`  canonical:  ${data.canonical_url ?? "(none)"}`);
if (data.published) {
  console.log(`  public URL: ${data.url}`);
} else {
  console.log(
    `  (draft — review at https://dev.to/dashboard, then publish from there)`
  );
}
