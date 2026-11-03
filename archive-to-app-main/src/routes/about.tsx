import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/about";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/about")({
  head: () => pageHead(page),
  component: StaticPageView,
});
