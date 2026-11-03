import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/countries__australia";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/countries/australia")({
  head: () => pageHead(page),
  component: StaticPageView,
});
