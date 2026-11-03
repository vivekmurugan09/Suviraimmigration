import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/index";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/")({
  head: () => pageHead(page),
  component: StaticPageView,
});
