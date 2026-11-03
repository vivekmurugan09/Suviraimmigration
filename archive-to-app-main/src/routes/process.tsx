import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/process";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/process")({
  head: () => pageHead(page),
  component: StaticPageView,
});
