import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/calculator__crs-express-entry";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/calculator/crs-express-entry")({
  head: () => pageHead(page),
  component: StaticPageView,
});
