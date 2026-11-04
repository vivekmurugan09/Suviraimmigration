import { useEffect, useRef } from "react";
import { Link } from '@tanstack/react-router';

import type { StaticPageData } from "@/content/types";
import { runPageScripts } from "@/lib/static-scripts";
import { installSiteEnhancements } from "@/lib/site-enhancements";

/**
 * Renders a page migrated from the original Suvira static site: the original
 * body markup plus JSON-LD structured data render server-side, while the
 * original inline/external scripts are re-executed on the client after mount.
 */
export function StaticPage({ page }: { page: StaticPageData }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cleanup = installSiteEnhancements(container);
    const controller = new AbortController();
    void runPageScripts(page.scripts, controller.signal);
    return () => { controller.abort(); cleanup(); };
  }, [page]);

  return (
    <>
      {(page.styles ?? []).map((css, i) => (
        <style key={i} dangerouslySetInnerHTML={{ __html: css }} />
      ))}
      <link rel="stylesheet" href="/site-polish.css" />
      {page.jsonLd.map((json, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
      <div className={`suvira-site${page.routePath === '/' ? ' suvira-editorial' : ''}${page.routePath.startsWith('/services/study-visas') || page.routePath.startsWith('/study-visas') ? ' suvira-study' : ''}${['/Thank-you', '/thankyou'].includes(page.routePath) ? ' suvira-confirmation' : ''}`} ref={containerRef} dangerouslySetInnerHTML={{ __html: page.body.replaceAll('/images/suvira-butterfly-icon.png', '/images/suvira-logo.png').replace(/(<a href="(?:(?:\/services)?\/study-visas)"[^>]*><i class="fas fa-graduation-cap"><\/i> Study Visa<\/a>)/g, '$1' + ['australia', 'canada', 'uk', 'germany', 'usa', 'ireland', 'newzealand'].map(country => `<a class="mobile-study-destination" href="/study-visas/${country}"><i class="fas fa-angle-right"></i> Study in ${({ uk: 'United Kingdom', usa: 'USA', newzealand: 'New Zealand' } as Record<string, string>)[country] || country.charAt(0).toUpperCase() + country.slice(1)}</a>`).join('')) }} />
      <Link to="/ai-preparation" className="fixed bottom-5 left-5 z-40 rounded-md border border-border bg-background px-4 py-3 text-sm font-semibold text-primary shadow-sm max-md:bottom-20">AI Preparation →</Link>
    </>
  );
}

export function pageHead(page: StaticPageData) {
  const description = page.metas.find(meta => meta.name === 'description')?.content || 'Thank you for contacting Suvira Immigration. Your enquiry has been received by our team.';
  const path = page.routePath === '/' ? '/' : `${page.routePath}/`;
  const managed = new Set(['description', 'og:title', 'og:description', 'og:type', 'og:url', 'twitter:card', 'twitter:title', 'twitter:description']);
  return {
    meta: [
      { title: page.title },
      ...page.metas.filter(meta => !managed.has(meta.name || meta.property || '')),
      { name: 'description', content: description },
      { property: 'og:title', content: page.title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: page.routePath.startsWith('/blog/') ? 'article' : 'website' },
      { property: 'og:url', content: path },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: page.title },
      { name: 'twitter:description', content: description },
      ...(['/Thank-you', '/thankyou'].includes(page.routePath) ? [{ name: 'robots', content: 'noindex, follow' }] : []),
    ],
    links: [...page.links.filter(link => link.rel !== 'canonical'), { rel: 'canonical', href: path }],
  };
}
