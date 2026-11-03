import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/free-eligibility-check";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/free-eligibility-check")({
  head: () => pageHead(page),
  component: StaticPageView,
});
