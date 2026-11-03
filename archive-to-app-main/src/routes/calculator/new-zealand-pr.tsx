import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/calculator__new-zealand-pr";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/calculator/new-zealand-pr")({
  head: () => pageHead(page),
  component: StaticPageView,
});
