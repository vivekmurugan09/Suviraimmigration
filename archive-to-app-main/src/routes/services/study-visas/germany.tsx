import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__study-visas__germany";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/study-visas/germany")({
  head: () => pageHead(page),
  component: StaticPageView,
});
