import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import {
  AdminError,
  createEnquiry,
  requireLocal,
  requireSameOrigin,
} from "@/lib/admin-store.server";

export const Route = createFileRoute("/api/enquiries")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
        try {
          requireLocal(request);
          requireSameOrigin(request);
          if (!request.headers.get("content-type")?.includes("application/json"))
            throw new AdminError(415, "JSON хүсэлт шаардлагатай.");
          const body = await request.text();
          if (body.length > 16000) throw new AdminError(413, "Хүсэлтийн хэмжээ хэтэрсэн.");
          let input: unknown;
          try {
            input = JSON.parse(body);
          } catch {
            throw new AdminError(400, "Хүсэлтийн бүтэц буруу байна.");
          }
          return Response.json(await createEnquiry(input), { status: 201, headers });
        } catch (error) {
          const status =
            error instanceof AdminError ? error.status : error instanceof z.ZodError ? 400 : 500;
          return Response.json(
            {
              error:
                status === 400
                  ? "Мэдээллээ шалгаад дахин оролдоно уу."
                  : error instanceof AdminError
                    ? error.message
                    : "Хүсэлт хадгалахад алдаа гарлаа. Дахин оролдоно уу.",
            },
            { status, headers },
          );
        }
      },
    },
  },
});
