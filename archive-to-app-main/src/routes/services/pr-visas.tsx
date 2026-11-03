import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__pr-visas";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/pr-visas")({
  head: () => pageHead(page),
  component: StaticPageView,
});
