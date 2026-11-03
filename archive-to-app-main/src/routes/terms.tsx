import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/terms";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/terms")({
  head: () => pageHead(page),
  component: StaticPageView,
});
