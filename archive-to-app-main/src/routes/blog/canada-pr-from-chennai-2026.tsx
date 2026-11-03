import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/blog__canada-pr-from-chennai-2026";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/blog/canada-pr-from-chennai-2026")({
  head: () => pageHead(page),
  component: StaticPageView,
});
