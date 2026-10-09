# Veyra Studio — first staging build (founder checklist)

**This is a staging build, not a public production launch.** The founder manages Netlify; repository contributors must not push private keys into GitHub.

## Source branch

- GitHub repository: `Timzee00/Veyra`
- Deploy branch: `feature/creator-experience-scale-foundation`
- Keep `main` unchanged until tests, security checks and sign-off pass.
- Node.js 22 or later (repo provides `.nvmrc`).
- Framework: Next.js App Router. Netlify's built-in Next.js/OpenNext adapter should be autodetected; do not pin or install a legacy Next.js plugin.
- Build command: `npm run build`. Suggested publish directory: `.next` (Netlify can fill this automatically).
- Use a dedicated staging site. If the existing `veyra-staging` site is available, attach Git only to that site. Never reuse Timzee Corp or Tech Blog sites.

## Environment settings (Netlify dashboard)

Set these on the Veyra staging site, not in the repository:

| Name | Setting |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Dedicated Veyra project API URL; project ID `ekqtxefvclfvwoslscmx` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Veyra project's **publishable** key from Supabase; this is browser-safe but project-specific |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged key; **secret**, never `NEXT_PUBLIC_`, never in Git |
| `NEXT_PUBLIC_APP_URL` | Exact full Netlify staging origin with HTTPS |
| `NEXT_PUBLIC_SITE_URL` | Exact full Netlify staging origin with HTTPS |
| `VEYRA_NOINDEX` | `true` on staging, until explicit public launch |

**Noindex does not protect private functionality.** If the staging URL should be restricted to your team, configure Netlify access controls separately.

### Supabase Auth

Open **Veyra → Authentication → URL configuration**. Set your desired staging site URL and allow the exact staging redirect `https://YOUR-STAGING-DOMAIN/auth/callback`. Confirm the email-confirmation and recovery emails return to Veyra. Do not add wildcard redirect domains wider than needed.

## Build reproducibility

The repository currently lacks a committed `package-lock.json`. Generate it once using a trusted npm registry:

```bash
npm install --package-lock-only --ignore-scripts
npm ci
npm run typecheck
npm run lint
npm run test:builder
npm run build
```

Review and commit the lockfile to the **development branch**. Until then, Netlify may use `npm install`; that may build but is not an accepted reproducible production setup. Do not fabricate lockfile integrity hashes.

## Functional browser acceptance

- Home page: brand/tagline, responsive Studio entry, search and discovery categories.
- `/studio`: render and navigate on 360px mobile, tablet, desktop; illustration clearly labeled conceptual.
- Sign up / sign in / password recovery / callback: no external redirects, no loop, confirmed sessions.
- Create first creator workspace: free `minimal` template works, draft remains private.
- Create/edit page: add blocks, save draft, undo/redo, export/import section bundles, saved library, publish, restore a previous publication.
- Download site-page JSON backup; confirm private drafts are present and document limits are respected.
- Different account cannot read private drafts, sections or unpublished pages.
- Accessibility: keyboard navigation, input labels, visible focus, small-screen horizontal overflow, reduced-motion.
- Logs: no private keys or user data accidentally printed in the browser/response.

Run the rollback-only database tests in `tests/db/` only in the dedicated staging Supabase project.

## Launch gate

Do not call the app production-ready until dependency installation, typecheck, lint, unit tests, build, real-device/browser tests, auth redirects, backup/recovery, and Supabase security review pass. Test with real accounts before accepting customer data.

Veyra — Imagine it. Build it. Own it. | Powered by Timzee Corp.
