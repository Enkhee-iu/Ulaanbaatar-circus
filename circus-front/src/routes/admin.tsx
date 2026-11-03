import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Удирдлага — Ulaanbaatar Circus" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPanel,
});
