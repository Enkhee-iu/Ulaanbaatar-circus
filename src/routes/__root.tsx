import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { getPublicContent } from "../lib/content";
import { SiteContentProvider } from "../components/site/SiteContent";
import { LanguageProvider } from "../components/site/Language";
import adminCss from "../admin.css?url";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl leading-none">404</h1>
        <h2 className="mt-4 font-display text-2xl uppercase tracking-[0.2em]">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The act you're looking for has left the stage.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center border border-foreground px-5 py-2.5 font-display text-sm uppercase tracking-[0.2em] transition-colors hover:bg-foreground hover:text-background"
          >
            Back to the ring
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl uppercase tracking-[0.15em]">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center border border-foreground bg-foreground px-4 py-2 font-display text-sm uppercase tracking-[0.2em] text-background"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center border border-foreground px-4 py-2 font-display text-sm uppercase tracking-[0.2em]"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: () => getPublicContent(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "UB Circus — Live Shows, Events & Productions in Ulaanbaatar" },
      {
        name: "description",
        content:
          "UB Circus is an Ulaanbaatar-based show production house creating live performances, brand events and cinematic projects.",
      },
      { name: "author", content: "UB Circus" },
      { property: "og:title", content: "UB Circus — Live Shows, Events & Productions" },
      {
        property: "og:description",
        content: "Extraordinary circus, live shows and experiences. Made in Ulaanbaatar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: adminCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="mn">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const content = Route.useLoaderData();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SiteContentProvider initialContent={content}>
          <Outlet />
        </SiteContentProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
