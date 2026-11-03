import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/")({
  head: () => pageHead(page),
  component: StaticPageView,
});
