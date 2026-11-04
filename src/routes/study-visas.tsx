import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/study-visas")({
  component: Outlet,
});
