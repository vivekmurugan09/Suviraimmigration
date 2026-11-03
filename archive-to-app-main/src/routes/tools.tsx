import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/tools";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/tools")({
  head: () => pageHead(page),
  component: StaticPageView,
});
