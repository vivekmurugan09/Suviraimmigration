# Site Updates & Refactor Log

## Frontend Design Updates (UI/UX)
- **Token System Migration**: Replaced mismatched hardcoded colors with a cohesive "Editorial Precision" design token system in `style.css` (`:root`).
- **Color Palette Overhaul**: Implemented Deep Navy (`#0A1128`), Crisp White (`#FFFFFF`), and Signal Orange (`#EA580C`) for authoritative, high-contrast layouts.
- **Typography Standardization**: Enforced `Outfit` for display headings and `Plus Jakarta Sans` for body copy across all structural classes.
- **Inline Style Cleanup**: Stripped ad-hoc inline `style="..."` attributes globally across the site to ensure reliance on the centralized CSS system.

## Performance Optimization 
- **Lazy Loading**: Added `loading="lazy"` attributes to all non-hero `<img>` tags across HTML files to improve Initial Load Time (LCP) and bandwidth consumption.
- **Font Preconnection**: Injected `<link rel="preconnect" href="https://fonts.googleapis.com">` in all `<head>` sections to eliminate render-blocking delay for Google Fonts.

## Code Architecture & Cleanliness
- **JavaScript Extraction**: Scraped all inline `<script>` tags (e.g., `switchHomeScore` logic) from `index.html` and other pages.
- **Centralized Scripting**: Moved extracted JS into a unified `script.js` file, linked with `defer` at the bottom of the `<body>`.
- **Accessibility Improvements (A11y)**: Added ARIA attributes (`aria-expanded`, `aria-controls`, `role="button"`) and keyboard navigation support (Enter/Space to toggle) for the mobile menu inside `script.js`.

## Security Implementations
- **Security Policy**: Created a `SECURITY.md` file in the root directory to outline baseline security protocols, reporting guidelines, and XSS/dependency management enforcement for the repository.
