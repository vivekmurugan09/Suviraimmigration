import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/blog__australia-vs-canada-pr-india";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/blog/australia-vs-canada-pr-india")({
  head: () => pageHead(page),
  component: StaticPageView,
});
