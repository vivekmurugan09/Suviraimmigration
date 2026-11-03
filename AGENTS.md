<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture

- This app is a migrated static marketing site (Suvira Immigration). Each page lives as a content module in `src/content/pages/*.ts` (original body markup, styles, scripts, JSON-LD) and renders through `src/components/static-page.tsx`, which replays the original page scripts client-side (`src/lib/static-scripts.ts`). Do not convert these pages to hand-written JSX; edit the content modules' HTML strings or regenerate from a source export instead.
- Keep existing page URLs stable, including `/Thank-you/` as a compatibility confirmation page; successful migrated form submissions now use `/thankyou`, sharing the original confirmation content. Preserve `/free-eligibility-check` without spaces.
- Assets referenced by migrated pages are plain files under `public/` (images, css, js, draw_data.json); they are not Tailwind design tokens. The site's own CSS reset coexists with Tailwind — keep per-page stylesheets loaded after the global `styles.css`.
- Shared presentation overrides live in `public/site-polish.css`, with semantic tokens defined in `src/styles.css`, so migrated pages retain their original markup while receiving consistent polish.
- The calculator hub uses a page-scoped stylesheet and semantic site tokens while retaining legacy element IDs and score handlers, so presentation changes do not alter calculations or submissions.
- StaticPage normalizes legacy header logo references to the original full Suvira logo; template-specific theme overrides remain centralized in site-polish.css to prevent page-to-page color drift.
- Generated pathway graphics are bundled asset imports in the homepage content module; shared visual motion stays in the enhancement lifecycle with reduced-motion support and cleanup to preserve migrated page behavior.
- Heroes get exactly three shared travel icons (plane, globe, map pin) injected by site-enhancements at mount; page-specific icon sets, brand-logo icons, and a reserved flight lane are rejected — do not reintroduce them.
- Capture migrated form submissions in `src/lib/site-enhancements.ts` before legacy handlers, and navigate to confirmation only after the form service explicitly confirms acceptance; this prevents duplicate sends and false successes.
- Content routes use `pageHead` for self-referencing relative canonical URLs and page-specific social metadata until a public domain is connected.
- Category routes with children render only Outlet; their content lives in sibling index routes, preventing parent content and canonical links from leaking into child pages.
- Every advertised study destination links to a dedicated static content route; mobile study links are centralized in StaticPage so navigation stays consistent across migrated pages.
- Study overview and country pages share scoped presentation in `public/study-premium.css`; preserve their migrated content and form handlers while using the enhancement lifecycle for scroll motion.
- Native AI tools use separate React routes and design-system controls, not the migrated script replay, to isolate interactive forms from legacy handlers.
- Tailwind utilities use important precedence so native tool controls and spacing survive unlayered migrated CSS after client navigation.
- Consultation preparation uses AI Gateway inside a validated server function, validates structured results, and keeps input/results in page state only to avoid storing personal background data.
