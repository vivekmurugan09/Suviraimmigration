import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/countries__ireland";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/countries/ireland")({
  head: () => pageHead(page),
  component: StaticPageView,
});
