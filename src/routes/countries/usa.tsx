import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/countries__usa";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/countries/usa")({
  head: () => pageHead(page),
  component: StaticPageView,
});
