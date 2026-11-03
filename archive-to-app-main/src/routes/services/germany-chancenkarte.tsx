import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__germany-chancenkarte";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/germany-chancenkarte")({
  head: () => pageHead(page),
  component: StaticPageView,
});
