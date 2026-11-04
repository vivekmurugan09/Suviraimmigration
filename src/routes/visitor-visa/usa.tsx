import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__visitor-visa__usa";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/visitor-visa/usa")({
  head: () => pageHead(page),
  component: StaticPageView,
});
