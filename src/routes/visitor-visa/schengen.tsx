import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__visitor-visa__schengen";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/visitor-visa/schengen")({
  head: () => pageHead(page),
  component: StaticPageView,
});
