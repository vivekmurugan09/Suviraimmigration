import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/disclaimer";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/disclaimer")({
  head: () => pageHead(page),
  component: StaticPageView,
});
