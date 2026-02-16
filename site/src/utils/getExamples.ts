import type { CollectionEntry } from "astro:content";

const getExamples = (examples: CollectionEntry<"examples">[]) => {
  return examples.sort(
    (a, b) =>
      Math.floor(new Date(b.data.createdDate).getTime() / 1000) -
      Math.floor(new Date(a.data.createdDate).getTime() / 1000)
  );
};

export default getExamples;
