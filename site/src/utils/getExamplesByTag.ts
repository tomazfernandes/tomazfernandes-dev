import type { CollectionEntry } from "astro:content";
import getExamples from "./getExamples";
import { slugifyAll } from "./slugify";

const getExamplesByTag = (
  examples: CollectionEntry<"examples">[],
  tag: string
) =>
  getExamples(
    examples.filter(example => slugifyAll(example.data.tags).includes(tag))
  );

export default getExamplesByTag;
