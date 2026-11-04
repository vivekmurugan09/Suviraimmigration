import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__study-visas__uk";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/study-visas/uk")({
  head: () => pageHead(page),
  component: StaticPageView,
});
