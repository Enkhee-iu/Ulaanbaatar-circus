import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { getPublicContent } from "../lib/content";
import { DEFAULT_CONTENT } from "../lib/content-types";
import { SiteContentProvider } from "../components/site/SiteContent";
import { LanguageProvider } from "../components/site/Language";
import { BrandLoading } from "../components/site/Loading";
import { NotFoundPage } from "../components/site/NotFoundPage";
import adminCss from "../admin.css?url";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BRAND_NAME, pageHead } from "../lib/page-meta";
import { siteOrigin } from "../lib/site-origin";

// A refresh starts at the top of the page. This has to run before the first paint and before the router
// reads its saved positions, or the page shows at the old spot and jumps. Back and forward keep theirs.
const START_AT_TOP_ON_RELOAD = `try{if(performance.getEntriesByType("navigation")[0]?.type==="reload"){history.scrollRestoration="manual";for(const k of Object.keys(sessionStorage))if(k.startsWith("tsr-scroll-restoration")){const s=JSON.parse(sessionStorage.getItem(k)||"{}");delete s[history.state?.__TSR_key];delete s[location.pathname+location.search+location.hash];sessionStorage.setItem(k,JSON.stringify(s))}}}catch{}`;

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
  loader: async ({ location }) => ({
    content:
      location.pathname.replace(/\/$/, "") === "/admin" ? DEFAULT_CONTENT : await getPublicContent(),
    origin: siteOrigin(),
  }),
  head: ({ loaderData }) => ({
    scripts: [{ children: START_AT_TOP_ON_RELOAD }],
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...pageHead("/").meta,
      { name: "author", content: BRAND_NAME },
      { property: "og:site_name", content: BRAND_NAME },
      { property: "og:type", content: "website" },
      // Link previews only accept a full address, which depends on the domain serving the page.
      { property: "og:image", content: `${loaderData?.origin ?? ""}/og-image.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${loaderData?.origin ?? ""}/og-image.jpg` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: adminCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Oswald:wght@500..600&family=Source+Sans+3:wght@400..700&display=swap",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Great+Vibes&family=Niconne&family=Pacifico&family=Playfair+Display:ital,wght@1,800&family=Satisfy&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="mn" className="dark" data-theme="dark">
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
  const { content } = Route.useLoaderData();
  // The router hands scrolling back to the browser on the way out, which would glide a refreshed page
  // toward the old spot before anything else runs. Its own saved positions cover back and forward.
  useEffect(() => {
    const keepManualScroll = () => {
      history.scrollRestoration = "manual";
    };
    addEventListener("pagehide", keepManualScroll);
    return () => removeEventListener("pagehide", keepManualScroll);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <SiteContentProvider initialContent={content}>
          <BrandLoading />
          <Outlet />
        </SiteContentProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
