import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { AdminError, readImage } from "@/lib/admin-store.server";
export const Route = createFileRoute("/api/media/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const image = await readImage(params.id);
          return new Response(new Uint8Array(image.bytes), {
            headers: {
              "Content-Type": image.type,
              "Cache-Control": "public, max-age=31536000, immutable",
              "X-Content-Type-Options": "nosniff",
            },
          });
        } catch (error) {
          return new Response(error instanceof AdminError ? error.message : "Зураг олдсонгүй.", {
            status: error instanceof AdminError ? error.status : 500,
          });
        }
      },
    },
  },
});
