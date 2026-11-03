import { createFileRoute } from "@tanstack/react-router";
import { StaticPage, pageHead } from "@/components/static-page";
import page from "@/content/pages/services__study-visas__usa";

export const Route = createFileRoute("/services/study-visas/usa")({
  head: () => pageHead(page),
  component: () => <StaticPage page={page} />,
});
