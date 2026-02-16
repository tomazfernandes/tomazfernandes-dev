import type { CollectionEntry } from "astro:content";
import { slugifyStr } from "./slugify";
import postFilter from "./postFilter";

interface Tag {
  tag: string;
  tagName: string;
}

const getUniqueTags = (
  posts: CollectionEntry<"blog">[],
  examples?: CollectionEntry<"examples">[]
) => {
  const postTags = posts
    .filter(postFilter)
    .flatMap(post => post.data.tags);

  const exampleTags = (examples ?? []).flatMap(example => example.data.tags);

  const tags: Tag[] = [...postTags, ...exampleTags]
    .map(tag => ({ tag: slugifyStr(tag), tagName: tag }))
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
  return tags;
};

export default getUniqueTags;
