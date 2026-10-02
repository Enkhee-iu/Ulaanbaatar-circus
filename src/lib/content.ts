import { createServerFn } from "@tanstack/react-start";
export const getPublicContent = createServerFn({ method: "GET" }).handler(async () => {
  const { readPublishedContent } = await import("./admin-store.server");
  return readPublishedContent();
});
