import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__spousal-sponsorship__uk";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/spousal-sponsorship/uk")({
  head: () => pageHead(page),
  component: StaticPageView,
});
