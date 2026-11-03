import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/privacy-policy";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/privacy-policy")({
  head: () => pageHead(page),
  component: StaticPageView,
});
