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
      <link rel="stylesheet" href="/site-polish.css?v=polish-v10" />
      <link rel="stylesheet" href="/study-metrics-anim.css?v=anim-v10" />
      <link rel="stylesheet" href="/study-journey-anim.css?v=journey-v10" />
      {page.jsonLd.map((json, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
      ))}
      <div className={`suvira-site${page.routePath === '/' ? ' suvira-editorial' : ''}${page.routePath.startsWith('/services/study-visas') || page.routePath.startsWith('/study-visas') ? ' suvira-study' : ''}${['/Thank-you', '/thankyou'].includes(page.routePath) ? ' suvira-confirmation' : ''}`} ref={containerRef} dangerouslySetInnerHTML={{ __html: page.body.replaceAll('/study-premium.css"', '/study-premium.css?v=prem-v10"').replaceAll('/images/suvira-butterfly-icon.png', '/images/suvira-logo.png').replace(/(<a href="(?:(?:\/services)?\/study-visas)"[^>]*><i class="fas fa-graduation-cap"><\/i> Study Visa<\/a>)/g, '$1' + ['australia', 'canada', 'uk', 'germany', 'usa', 'ireland', 'newzealand'].map(country => `<a class="mobile-study-destination" href="/study-visas/${country}"><i class="fas fa-angle-right"></i> Study in ${({ uk: 'United Kingdom', usa: 'USA', newzealand: 'New Zealand' } as Record<string, string>)[country] || country.charAt(0).toUpperCase() + country.slice(1)}</a>`).join('')) }} />
      <Link to="/ai-preparation" className="fixed bottom-5 left-5 z-40 rounded-md border border-border bg-background px-4 py-3 text-sm font-semibold text-primary shadow-sm max-md:bottom-20">AI Preparation →</Link>
    </>
  );
}

function getCanonicalPath(routePath: string): string {
  if (routePath === '/') return '/';
  if (routePath === '/Thank-you') return '/Thank-you/';
  if (routePath === '/free-eligibility-check') return '/free-eligibility-check';
  const map: Record<string, string> = {
    '/services/pr-visas': '/immigration-pr/',
    '/services/canada-pr': '/immigration-pr/canada-pr/',
    '/services/australia-pr': '/immigration-pr/australia-pr/',
    '/services/uk-pr': '/immigration-pr/uk-pr/',
    '/services/germany-pr': '/immigration-pr/germany-pr/',
    '/services/germany-chancenkarte': '/immigration-pr/germany-chancenkarte/',
    '/services/sop-writing': '/sop-writing/',
    '/countries/newzealand': '/study-visas/newzealand/',
    '/countries/ireland': '/study-visas/ireland/',
    '/countries/usa': '/study-visas/usa/',
    '/countries/uk': '/study-visas/uk/',
    '/countries/australia': '/study-visas/australia/',
    '/countries/canada': '/immigration-pr/canada-pr/',
    '/countries/germany': '/immigration-pr/germany-pr/',
  };
  if (map[routePath]) return map[routePath];
  if (routePath.startsWith('/services/study-visas')) return routePath.replace('/services/study-visas', '/study-visas') + '/';
  if (routePath.startsWith('/services/spousal-sponsorship')) return routePath.replace('/services/spousal-sponsorship', '/spousal-sponsorship') + '/';
  if (routePath.startsWith('/services/visitor-visa')) return routePath.replace('/services/visitor-visa', '/visitor-visa') + '/';
  return routePath.endsWith('/') ? routePath : `${routePath}/`;
}

export function pageHead(page: StaticPageData) {
  const description = page.metas.find(meta => meta.name === 'description')?.content || 'Thank you for contacting Suvira Immigration. Your enquiry has been received by our team.';
  const path = getCanonicalPath(page.routePath);
  const managed = new Set(['description', 'og:title', 'og:description', 'og:type', 'og:url', 'twitter:card', 'twitter:title', 'twitter:description']);
  const standardFavicons = [
    { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'icon', href: '/favicon.png', sizes: '32x32', type: 'image/png' },
    { rel: 'icon', href: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    { rel: 'icon', href: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    { rel: 'icon', href: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
  ];
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
    links: [
      ...standardFavicons,
      ...page.links.filter(link => link.rel !== 'canonical' && !link.rel.includes('icon')),
      { rel: 'canonical', href: path },
    ],
  };
}
