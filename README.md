# tomazfernandes.dev

Monorepo for [tomazfernandes.dev](https://tomazfernandes.dev) — a static technical blog built with [Astro](https://astro.build/) + [AstroPaper](https://github.com/satnaing/astro-paper) and deployed to [Cloudflare Pages](https://pages.cloudflare.com/).

## Repo Layout

```
tomazfernandes-dev/
├── site/                        # Astro project (blog, pages, styles)
│   ├── src/data/blog/           # Blog posts (Markdown)
│   ├── src/data/examples/       # Example metadata (Markdown)
│   ├── src/components/          # Astro components
│   ├── src/layouts/             # Page layouts
│   ├── src/pages/               # Route pages
│   └── src/utils/               # Utility functions
├── examples/                    # Runnable example projects (Spring Boot, Docker Compose, etc.)
└── README.md
```

The **site** contains the Astro blog. **examples** holds standalone projects referenced by blog posts.

## Development

```bash
cd site
npm install
npm run dev       # Start dev server at localhost:4321
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (includes Pagefind search indexing) |
| `npm run preview` | Preview production build locally |
| `npm run validate` | Validate front matter in content files |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run lint` | Lint with ESLint |

## Adding a Blog Post

1. Create a new file in `site/src/data/blog/` named `yyyy-mm-dd-slug.md`
2. Add front matter:

```yaml
---
title: "Your Post Title"
slug: "your-post-slug"
description: "A short description for SEO and cards."
pubDatetime: 2025-02-01T00:00:00Z
tags: ["spring-boot", "aws"]
draft: false
examples: ["related-example-slug"]
---
```

3. Write your content in Markdown. Mermaid diagrams are supported via fenced code blocks with the `mermaid` language tag.

**URL convention:** Posts are served at `/posts/<slug>/` where `slug` comes from the front matter, not the filename. Dated filenames are for filesystem sorting only.

## Adding an Example Project

1. Create the project directory under `examples/` (e.g., `examples/my-example/`)
2. Create a metadata file in `site/src/data/examples/my-example.md`:

```yaml
---
title: "My Example"
slug: "my-example"
description: "What this example demonstrates."
tags: ["spring-boot"]
createdDate: 2025-02-01T00:00:00Z
repoPath: "examples/my-example"
postSlugs: ["related-post-slug"]
---
```

3. Write any additional documentation in the markdown body.

## Cloudflare Pages Deployment

| Setting | Value |
|---------|-------|
| Framework preset | Astro |
| Root directory | `site` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | 20 (via `.nvmrc`) |

## Tech Stack

- **Astro 5.x** — static site generator
- **AstroPaper v5** — blog theme (dark mode, search, SEO, pagination)
- **Tailwind CSS v4** — styling
- **Pagefind** — static full-text search
- **Shiki** — syntax highlighting with code transformers
- **Mermaid** — client-side diagram rendering (pinned CDN)
- **Cloudflare Pages** — hosting and deployment

## License

MIT
