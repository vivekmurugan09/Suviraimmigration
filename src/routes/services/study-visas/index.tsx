import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__study-visas";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/study-visas/")({
  head: () => pageHead(page),
  component: StaticPageView,
});
