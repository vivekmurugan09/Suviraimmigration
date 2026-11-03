import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/Thank-you";

const StaticPageView = () => <StaticPage page={page} />;

export const Route = createFileRoute("/Thank-you")({
  head: () => pageHead(page),
  component: StaticPageView,
});
