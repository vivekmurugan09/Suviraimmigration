import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/countries__uk";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/countries/uk")({
  head: () => pageHead(page),
  component: StaticPageView,
});
