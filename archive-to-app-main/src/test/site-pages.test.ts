import { describe, expect, it } from 'vitest';
import type { StaticPageData } from '@/content/types';
import { pageHead } from '@/components/static-page';

const pages = Object.values(import.meta.glob<{ default: StaticPageData }>('../content/pages/*.ts', { eager: true })).map(module => module.default);

describe('Public page identity', () => {
  it('assigns a self-referencing canonical to every content page', () => {
    expect(pages).toHaveLength(65);
    for (const page of pages) {
      const expected = page.routePath === '/' ? '/' : `${page.routePath}/`;
      expect(pageHead(page).links.filter(link => link.rel === 'canonical').map(link => link.href)).toEqual([expected]);
    }
  });
});