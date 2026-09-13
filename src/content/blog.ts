export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  featured?: boolean;
  body: { heading?: string; paragraphs: string[] }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "why-veyra-exists",
    title: "Why Veyra exists: creative work deserves a better home",
    excerpt:
      "A portfolio should do more than display finished work. It should explain the thinking, build trust, and make the next conversation easier.",
    date: "September 2026",
    readTime: "5 min read",
    category: "Veyra Journal",
    image: "/blog/why-veyra-exists.svg",
    featured: true,
    body: [
      {
        paragraphs: [
          "Creative work is often judged in seconds, but the work behind it can take days, weeks, or months. A good portfolio needs to close that gap: make the work immediately compelling while giving serious visitors enough context to understand the thinking behind it.",
          "Veyra is being built around that idea. It is not just a page builder and it is not another feed that disappears into an algorithm. It is a creator-owned presentation layer where projects, stories, services, proof, and conversations can live together.",
        ],
      },
      {
        heading: "The portfolio is becoming a product",
        paragraphs: [
          "Creators increasingly need more than a gallery. They need a clear identity, case studies, ways to be contacted, useful analytics, social proof, and a publishing workflow that does not fight the way creative work is actually made.",
          "That means Veyra has to behave like a product system: content stays separate from presentation, access stays separate from billing, and platform rules stay enforceable instead of being hidden inside individual pages.",
        ],
      },
      {
        heading: "Presentation should be flexible",
        paragraphs: [
          "Changing a portfolio template should never mean rebuilding every project. Veyra treats templates as structured presentation systems so the same body of work can move from minimal to editorial, cinema, immersive, studio, or agency compositions.",
          "That architecture also leaves room for deeper customization later: typography, color systems, gradients, spacing, motion, backgrounds, and eventually AI-assisted template creation without turning creator data into generated code that is difficult to maintain.",
        ],
      },
      {
        heading: "The goal",
        paragraphs: [
          "The long-term goal is simple: make it easier for great work to be discovered, understood, remembered, and acted on. Veyra is being built one system at a time to make that possible.",
        ],
      },
    ],
  },
  {
    slug: "portfolio-case-study",
    title: "From gallery to case study: showing how the work happened",
    excerpt:
      "A strong project page should reveal decisions, not just outcomes. Here is the structure Veyra is designed to support.",
    date: "September 2026",
    readTime: "4 min read",
    category: "Creator Notes",
    image: "/blog/portfolio-case-study.svg",
    body: [
      {
        paragraphs: [
          "A gallery can prove that you made something. A case study can explain why it works. For creative professionals, that difference matters because clients often buy judgment, not just visual output.",
        ],
      },
      {
        heading: "Start with the brief",
        paragraphs: [
          "Give the visitor enough context to understand the original problem: what needed to change, who the work was for, and what success needed to look like. Keep it clear enough to scan quickly.",
        ],
      },
      {
        heading: "Show the system behind the final piece",
        paragraphs: [
          "Move beyond the hero image. Include direction, typography, color decisions, motion frames, packaging, social applications, or other outputs that demonstrate the system rather than a single artifact.",
        ],
      },
      {
        heading: "Finish with a next step",
        paragraphs: [
          "The best case study ends with an invitation: start a project, ask a question, view another related project, or continue to the creator's services. The portfolio should help a visitor decide what to do next.",
        ],
      },
    ],
  },
  {
    slug: "templates-are-not-skins",
    title: "Templates are not skins",
    excerpt:
      "Why Veyra treats templates as presentation systems with versions, capabilities, and creator-level design controls.",
    date: "September 2026",
    readTime: "6 min read",
    category: "Product",
    image: "/blog/templates-are-not-skins.svg",
    body: [
      {
        paragraphs: [
          "A serious template system changes composition, hierarchy, rhythm, and interaction. Swapping a purple background for a blue one is not enough. Veyra's templates are meant to feel like different creative directions while still using the same underlying creator data.",
        ],
      },
      {
        heading: "Content first, presentation second",
        paragraphs: [
          "Projects, posts, services, social links, and profile information belong to the creator. A template consumes that data through shared components and layouts. This keeps the content portable and makes the platform easier to evolve.",
        ],
      },
      {
        heading: "Version everything that can change",
        paragraphs: [
          "Templates are versioned deliberately. A creator using Cinema v1.2 should not wake up one morning to a completely different site because a newer release shipped. Upgrades can be previewed and chosen, while critical platform or security issues can still be handled through controlled migration.",
        ],
      },
      {
        heading: "Customization without chaos",
        paragraphs: [
          "Creator controls are represented as design tokens: color, typography, spacing, shape, border, shadow, background, and motion. Templates declare which controls they support, so the editor can stay powerful without becoming confusing.",
        ],
      },
    ],
  },
  {
    slug: "building-in-public",
    title: "Building Veyra in public, one system at a time",
    excerpt:
      "What happens when the product, the engineering process, and the learning journey are allowed to improve together.",
    date: "September 2026",
    readTime: "3 min read",
    category: "Build Log",
    image: "/blog/building-in-public.svg",
    body: [
      {
        paragraphs: [
          "Veyra is being built as a real product and as a serious engineering learning project. That changes how the work is approached: architecture is written down, security boundaries are considered early, and each new feature should leave behind a reusable pattern instead of a one-off shortcut.",
          "The result is intentionally incremental. Public pages come first, followed by creator identity, publishing, media, templates, engagement, inquiries, monetization, and eventually deeper discovery and marketplace capabilities.",
        ],
      },
      {
        heading: "Why document the work",
        paragraphs: [
          "A build log creates a record of decisions. It makes trade-offs visible, gives future contributors context, and turns the product's own history into a resource for creators who are curious about how their platform is made.",
        ],
      },
    ],
  },
];

export const featuredPost = blogPosts.find((post) => post.featured) ?? blogPosts[0];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}
