import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/calculator";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/calculator/")({
  head: () => pageHead(page),
  component: StaticPageView,
});
