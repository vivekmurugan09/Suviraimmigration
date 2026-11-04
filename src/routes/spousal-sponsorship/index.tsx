import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__spousal-sponsorship";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/spousal-sponsorship/")({
  head: () => pageHead(page),
  component: StaticPageView,
});
