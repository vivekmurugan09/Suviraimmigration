import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/services/visitor-visa")({
  component: Outlet,
});
