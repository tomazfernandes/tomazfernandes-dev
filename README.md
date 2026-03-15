# tomazfernandes.dev

Source repository for [tomazfernandes.dev](https://tomazfernandes.dev), a technical blog by Tomaz Fernandes about distributed systems, reliability, observability, messaging, and shipping small, reversible, production-safe changes.

## Start here

- [Visit the blog](https://tomazfernandes.dev)
- [Browse blog posts in plain Markdown](posts/)
- [Explore runnable examples](examples/)

This repository is designed to be useful both as the source for the site and as a browsable content/code repository.

You can:

- read posts directly from Markdown under [`/posts`](posts/)
- inspect runnable example projects under [`/examples`](examples/)
- clone the repo and let your own tools or agents consume the content locally

## About the site

Hi, I'm Tomaz Fernandes, a software engineer based in Rio de Janeiro, Brazil, with 10+ years of experience.

I write about distributed systems: reliability, observability, messaging, and shipping small, reversible, production-safe changes. This site is where I publish technical notes, mental models, and occasional deep dives.

### OSS work

- Lead maintainer for SQS in [Spring Cloud AWS](https://docs.awspring.io/spring-cloud-aws/docs/4.0.0/reference/html/index.html#sqs-integration)
- [AWS Community Builder](https://builder.aws.com/community/@tomazfernandes)
- Author of Spring Cloud AWS SQS articles on [Baeldung](https://www.baeldung.com/author/tomazfernandes)
- Contributor of the [non-blocking delayed retries](https://docs.spring.io/spring-kafka/reference/retrytopic.html) feature in Spring for Apache Kafka

## What's in this repository

- [`posts/`](posts/) contains all blog posts as plain Markdown
- [`examples/`](examples/) contains runnable example projects referenced by selected posts
- [`site/`](site/) contains the Astro site used to render and publish the blog
- [`site/src/data/examples/`](site/src/data/examples/) contains example metadata used by the site

## Repo layout

    tomazfernandes-dev/
    ├── posts/                       # Blog posts (Markdown) — © 2026 Tomaz Fernandes
    ├── site/                        # Astro project (blog, pages, styles) — MIT
    │   ├── src/data/examples/       # Example metadata (Markdown)
    │   ├── src/components/          # Astro components
    │   ├── src/layouts/             # Page layouts
    │   ├── src/pages/               # Route pages
    │   └── src/utils/               # Utility functions
    ├── examples/                    # Runnable example projects — MIT
    ├── LICENSE                      # MIT License (code and site source)
    ├── CONTENT_LICENSE.md           # All rights reserved (blog posts)
    └── README.md

## Content and examples

The Examples section of the site contains runnable examples for selected posts.

This repository keeps the content easy to inspect directly:

- posts are stored as plain Markdown under [`/posts`](posts/)
- example projects live under [`/examples`](examples/)
- site infrastructure lives under [`/site`](site/)

That means you can read the posts without the site, inspect example code alongside the post it supports, or clone the repository and index the content locally with your own tooling.

## Keep in touch

You can also find me on [GitHub](https://github.com/tomazfernandes), [LinkedIn](https://www.linkedin.com/in/tomaz-fernandes/), and [X](https://x.com/tomazfernandes_).

## License

- **Code samples, examples, and site source** (`/site`, `/examples`, and other code) are licensed under the [MIT License](LICENSE)
- **Blog posts and written content** (`/posts`) are © 2026 Tomaz Fernandes. All rights reserved. See [CONTENT_LICENSE.md](CONTENT_LICENSE.md)