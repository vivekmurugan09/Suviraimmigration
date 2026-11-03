import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__spousal-sponsorship__usa";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/services/spousal-sponsorship/usa")({
  head: () => pageHead(page),
  component: StaticPageView,
});
