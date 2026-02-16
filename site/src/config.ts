export const SITE = {
  website: "https://tomazfernandes.dev/",
  author: "Tomaz Fernandes",
  profile: "https://github.com/tomazfernandes",
  desc: "Technical blog about software engineering, Spring Boot, AWS, and distributed systems.",
  title: "Tomaz Fernandes",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: true,
    text: "Edit page",
    url: "https://github.com/tomazfernandes/tomazfernandes-dev/edit/main/site/",
  },
  dynamicOgImage: false,
  dir: "ltr",
  lang: "en",
  timezone: "America/Sao_Paulo",
} as const;
