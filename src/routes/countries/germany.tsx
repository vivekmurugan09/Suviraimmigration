import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/countries__germany";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/countries/germany")({
  head: () => pageHead(page),
  component: StaticPageView,
});
