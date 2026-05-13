import type { APIRoute } from "astro";

const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "GoogleOther",
  "Applebot-Extended",
  "Bingbot",
  "Amazonbot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "DuckAssistBot",
  "Bytespider",
  "cohere-ai",
  "cohere-training-data-crawler",
];

const getRobotsTxt = (site: URL) => {
  const sitemapURL = new URL("sitemap-index.xml", site).href;
  const llmsURL = new URL("llms.txt", site).href;
  const contentSignal = "Content-Signal: ai-train=no, search=yes, ai-input=yes";
  const aiBotRules = AI_BOTS.map(
    bot => `User-agent: ${bot}\nAllow: /\n${contentSignal}`,
  ).join("\n\n");
  return `User-agent: *
Allow: /
${contentSignal}

${aiBotRules}

Sitemap: ${sitemapURL}

# Agent-readable index
# ${llmsURL}
`;
};

export const GET: APIRoute = ({ site }) => {
  return new Response(getRobotsTxt(site!), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
