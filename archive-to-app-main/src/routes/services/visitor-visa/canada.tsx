import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__visitor-visa__canada";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/visitor-visa/canada")({
  head: () => pageHead(page),
  component: StaticPageView,
});
