import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/countries";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/countries/")({
  head: () => pageHead(page),
  component: StaticPageView,
});
