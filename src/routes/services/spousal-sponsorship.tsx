import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/services/spousal-sponsorship")({
  component: Outlet,
});
