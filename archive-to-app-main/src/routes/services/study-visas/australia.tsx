import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__study-visas__australia";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/study-visas/australia")({
  head: () => pageHead(page),
  component: StaticPageView,
});
