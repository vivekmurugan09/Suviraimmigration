import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/contact";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/contact")({
  head: () => pageHead(page),
  component: StaticPageView,
});
