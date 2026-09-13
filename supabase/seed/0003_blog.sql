insert into public.blog_posts
  (slug, title, excerpt, category, cover_path, content_json, author_name, status, seo_title, seo_description, published_at)
values
  (
    'why-veyra-exists',
    'Why Veyra exists: creative work deserves a better home',
    'A portfolio should do more than display finished work. It should explain the thinking, build trust, and make the next conversation easier.',
    'Veyra Journal',
    '/blog/why-veyra-exists.svg',
    '[{"heading":null,"paragraphs":["Creative work is often judged in seconds, but the work behind it can take days, weeks, or months. A good portfolio needs to close that gap.","Veyra is being built around that idea: a creator-owned presentation layer where projects, stories, services, proof, and conversations can live together."]},{"heading":"The portfolio is becoming a product","paragraphs":["Creators increasingly need more than a gallery. They need a clear identity, case studies, ways to be contacted, useful analytics, social proof, and a publishing workflow that does not fight the way creative work is made."]},{"heading":"The goal","paragraphs":["Make it easier for great work to be discovered, understood, remembered, and acted on."]}]'::jsonb,
    'Veyra', 'published',
    'Why Veyra exists — Veyra Journal',
    'The thinking behind Veyra and its creator-first portfolio platform.',
    now()
  ),
  (
    'portfolio-case-study',
    'From gallery to case study: showing how the work happened',
    'A strong project page should reveal decisions, not just outcomes. Here is the structure Veyra is designed to support.',
    'Creator Notes',
    '/blog/portfolio-case-study.svg',
    '[{"heading":"Start with the brief","paragraphs":["Give the visitor enough context to understand the original problem: what needed to change, who the work was for, and what success needed to look like."]},{"heading":"Show the system behind the final piece","paragraphs":["Move beyond the hero image. Include direction, typography, color decisions, motion frames, packaging, social applications, or other outputs that demonstrate the system."]},{"heading":"Finish with a next step","paragraphs":["The best case study ends with an invitation: start a project, ask a question, view another related project, or continue to services."]}]'::jsonb,
    'Veyra', 'published',
    'From gallery to case study — Veyra',
    'How to turn a finished project into a useful creative case study.',
    now()
  ),
  (
    'templates-are-not-skins',
    'Templates are not skins',
    'Why Veyra treats templates as presentation systems with versions, capabilities, and creator-level design controls.',
    'Product',
    '/blog/templates-are-not-skins.svg',
    '[{"heading":"Content first, presentation second","paragraphs":["Projects, posts, services, social links, and profile information belong to the creator. A template consumes that data through shared components and layouts."]},{"heading":"Version everything that can change","paragraphs":["A creator using Cinema v1.2 should not wake up one morning to a completely different site because a newer release shipped. Upgrades can be previewed and chosen."]},{"heading":"Customization without chaos","paragraphs":["Creator controls are represented as design tokens: color, typography, spacing, shape, border, shadow, background, and motion."]}]'::jsonb,
    'Veyra', 'published',
    'Templates are not skins — Veyra',
    'Why Veyra treats templates as structured presentation systems.',
    now()
  ),
  (
    'building-in-public',
    'Building Veyra in public, one system at a time',
    'What happens when the product, the engineering process, and the learning journey are allowed to improve together.',
    'Build Log',
    '/blog/building-in-public.svg',
    '[{"heading":null,"paragraphs":["Veyra is being built as a real product and as a serious engineering learning project. Architecture is written down, security boundaries are considered early, and reusable patterns matter more than one-off shortcuts."]},{"heading":"Why document the work","paragraphs":["A build log creates a record of decisions. It makes trade-offs visible, gives future contributors context, and turns the product history into a resource for creators who want to understand how the platform is made."]}]'::jsonb,
    'Veyra', 'published',
    'Building Veyra in public — Veyra Build Log',
    'A running record of the systems and engineering decisions behind Veyra.',
    now()
  )
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  category = excluded.category,
  cover_path = excluded.cover_path,
  content_json = excluded.content_json,
  author_name = excluded.author_name,
  status = excluded.status,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  published_at = excluded.published_at,
  updated_at = now();
