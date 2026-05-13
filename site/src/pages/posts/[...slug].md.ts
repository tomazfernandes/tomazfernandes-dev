import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  return posts.map(post => ({
    params: { slug: post.data.slug },
    props: { post },
  }));
}

export const GET: APIRoute = ({ props }) => {
  const { post } = props as { post: { body?: string } };
  return new Response(post.body ?? "", {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
