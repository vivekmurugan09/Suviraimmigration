import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/calculator__canada-pr-eligibility";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/calculator/canada-pr-eligibility")({
  head: () => pageHead(page),
  component: StaticPageView,
});
