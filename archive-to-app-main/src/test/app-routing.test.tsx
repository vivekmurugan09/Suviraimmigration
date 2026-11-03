import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches the migrated site pages, including trailing-slash URLs", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    for (const path of ["/about", "/Thank-you/", "/thankyou", "/free-eligibility-check/", "/countries/canada", "/calculator/"]) {
      const matches = router.matchRoutes(path);
      expect(matches.at(-1)?.routeId, `no route matched ${path}`).not.toBe(rootRouteId);
    }
  });

  it("opens a separate page for every study destination", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const country of ['australia', 'canada', 'germany', 'uk', 'usa', 'ireland', 'newzealand']) {
      const path = `/services/study-visas/${country}`;
      expect(router.matchRoutes(path).at(-1)?.routeId).toBe(path);
    }
  });
});
