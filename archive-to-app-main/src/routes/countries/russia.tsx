import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/countries__russia";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/countries/russia")({
  head: () => pageHead(page),
  component: StaticPageView,
});
