import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/calculator__germany-opportunity-card";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/calculator/germany-opportunity-card")({
  head: () => pageHead(page),
  component: StaticPageView,
});
