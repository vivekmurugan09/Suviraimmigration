import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/immigration-pr")({
  component: Outlet,
});
