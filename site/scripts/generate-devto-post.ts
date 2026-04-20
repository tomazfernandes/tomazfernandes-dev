import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../..");

const POST_PATH = path.join(
  REPO_ROOT,
  "posts/from-sqslistener-to-your-method/from-sqslistener-to-your-method.md"
);
const OUT_DEVTO = path.join(
  REPO_ROOT,
  "posts/from-sqslistener-to-your-method/devto.md"
);
const OUT_IMAGES_DIR = path.join(
  REPO_ROOT,
  "site/public/images/posts/from-sqslistener-to-your-method"
);

const IMAGE_URL_BASE =
  "https://tomazfernandes.dev/images/posts/from-sqslistener-to-your-method";
const CANONICAL =
  "https://tomazfernandes.dev/posts/from-sqslistener-to-your-method/";

const raw = await fs.readFile(POST_PATH, "utf8");

const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
if (!fmMatch) throw new Error("No frontmatter found");
const body = raw.slice(fmMatch[0].length);

const mermaidRe = /```mermaid\n([\s\S]*?)\n```/g;
const diagrams: { original: string; code: string; i: number }[] = [];
let m: RegExpExecArray | null;
let index = 0;
while ((m = mermaidRe.exec(body)) !== null) {
  index++;
  diagrams.push({ original: m[0], code: m[1], i: index });
}

console.log(`Found ${diagrams.length} Mermaid diagram(s)`);

await fs.mkdir(OUT_IMAGES_DIR, { recursive: true });

for (const d of diagrams) {
  const encoded = Buffer.from(d.code, "utf8").toString("base64url");
  const url = `https://mermaid.ink/img/${encoded}?type=png&bgColor=white`;
  process.stdout.write(`  Fetching diagram ${d.i}... `);
  const res = await fetch(url);
  if (!res.ok) {
    console.log(`FAILED (${res.status})`);
    throw new Error(
      `mermaid.ink returned ${res.status} for diagram ${d.i}. URL: ${url.slice(0, 120)}...`
    );
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = `diagram-${d.i}.png`;
  await fs.writeFile(path.join(OUT_IMAGES_DIR, filename), buf);
  console.log(`saved ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
}

let devtoBody = body;
for (const d of diagrams) {
  const imageRef = `![Diagram ${d.i}](${IMAGE_URL_BASE}/diagram-${d.i}.png)`;
  devtoBody = devtoBody.replace(d.original, imageRef);
}

const devtoFm = `---
title: What Happens Between @SqsListener and Your Method in Spring Cloud AWS SQS
description: A walkthrough of the full SQS listener lifecycle in Spring Cloud AWS SQS, from annotation detection at startup to the composable async pipeline that polls, processes, and acknowledges every message.
published: false
tags: java, spring, aws, sqs
canonical_url: ${CANONICAL}
cover_image: https://tomazfernandes.dev/posts/from-sqslistener-to-your-method/index.png
---

*Originally published at [tomazfernandes.dev](${CANONICAL}).*

`;

await fs.writeFile(OUT_DEVTO, devtoFm + devtoBody.replace(/^\s+/, ""));
console.log(`\nWrote ${path.relative(REPO_ROOT, OUT_DEVTO)}`);
console.log(
  `Images ready to be served at ${IMAGE_URL_BASE}/diagram-{1..${diagrams.length}}.png once deployed.`
);
