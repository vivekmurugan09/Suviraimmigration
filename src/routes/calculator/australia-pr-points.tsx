import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/calculator__australia-pr-points";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/calculator/australia-pr-points")({
  head: () => pageHead(page),
  component: StaticPageView,
});
