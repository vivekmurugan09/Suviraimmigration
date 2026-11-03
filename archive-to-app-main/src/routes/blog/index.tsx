import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/blog";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/blog/")({
  head: () => pageHead(page),
  component: StaticPageView,
});
