import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { handleAdminRequest } from "@/lib/admin-api.server";

export const Route = createFileRoute("/api/admin/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAdminRequest(request),
      POST: ({ request }) => handleAdminRequest(request),
      PUT: ({ request }) => handleAdminRequest(request),
    },
  },
});
