export const SITE = {
  website: "https://tomazfernandes.dev/",
  author: "Tomaz Fernandes",
  profile: "https://github.com/tomazfernandes",
  desc: "Pragmatic Distributed Systems. Software Engineer, Lead maintainer for SQS in Spring Cloud AWS, AWS Community Builder.",
  title: "Tomaz Fernandes",
  ogImage: "og.png",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Edit page",
    url: "https://github.com/tomazfernandes/tomazfernandes-dev/edit/main/site/",
  },
  dynamicOgImage: false,
  dir: "ltr",
  lang: "en",
  timezone: "America/Sao_Paulo",
} as const;
