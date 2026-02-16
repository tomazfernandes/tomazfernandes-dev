export function postUrl(post: { data: { slug: string } }): string {
  return `/posts/${post.data.slug}/`;
}
