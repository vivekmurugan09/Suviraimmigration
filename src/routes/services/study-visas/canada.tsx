import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__study-visas__canada";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/study-visas/canada")({
  head: () => pageHead(page),
  component: StaticPageView,
});
