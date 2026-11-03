import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/services/study-visas")({
  component: Outlet,
});
