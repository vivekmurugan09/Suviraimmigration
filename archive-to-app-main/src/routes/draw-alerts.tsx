import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/draw-alerts";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/draw-alerts")({
  head: () => pageHead(page),
  component: StaticPageView,
});
