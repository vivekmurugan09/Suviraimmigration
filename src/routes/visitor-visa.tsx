import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/visitor-visa")({
  component: Outlet,
});
