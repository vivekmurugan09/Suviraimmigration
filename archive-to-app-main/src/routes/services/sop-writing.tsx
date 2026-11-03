import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__sop-writing";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/sop-writing")({
  head: () => pageHead(page),
  component: StaticPageView,
});
