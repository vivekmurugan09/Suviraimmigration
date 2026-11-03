export interface StaticPageMeta {
  name?: string;
  property?: string;
  httpEquiv?: string;
  content: string;
}

export interface StaticPageLink {
  rel: string;
  href: string;
  sizes?: string;
  type?: string;
  crossorigin?: string;
  color?: string;
  media?: string;
  as?: string;
  fetchpriority?: string;
}

export interface StaticPageScript {
  src?: string;
  inline?: string;
  type?: string;
}

export interface StaticPageData {
  routePath: string;
  title: string;
  metas: StaticPageMeta[];
  links: StaticPageLink[];
  styles: string[];
  body: string;
  scripts: StaticPageScript[];
  jsonLd: string[];
}
