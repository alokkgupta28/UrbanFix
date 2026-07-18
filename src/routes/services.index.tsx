import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useMemo, useState } from "react";
import { Search, ArrowRight, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { ProviderPreviewDialog } from "@/components/site/ProviderPreviewDialog";
import { categoriesQuery, providersQuery, type Provider } from "@/lib/queries";
import { providerAvatar } from "@/lib/assets";

const search = z.object({ q: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "All services — UrbanFix" },
      { name: "description", content: "Browse UrbanFix's full range of home services: electrician, plumber, deep cleaning, AC repair, salon at home and more." },
      { property: "og:title", content: "All services — UrbanFix" },
      { property: "og:description", content: "Browse UrbanFix's full range of home services." },
    ],
  }),
  validateSearch: search,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQuery);
    context.queryClient.ensureQueryData(providersQuery);
  },
  component: ServicesIndex,
});

function ServicesIndex() {
  const { q: initialQ } = Route.useSearch();
  const cats = useSuspenseQuery(categoriesQuery).data;
  const providers = useSuspenseQuery(providersQuery).data;
  const [q, setQ] = useState(initialQ ?? "");
  const [previewPro, setPreviewPro] = useState<Provider | null>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return cats;
    return cats.filter((c) =>
      [c.name, c.tagline, c.description, c.slug].join(" ").toLowerCase().includes(s),
    );
  }, [cats, q]);



  return (
    <>
      <ProviderPreviewDialog
        provider={previewPro}
        open={previewPro !== null}
        onOpenChange={(o) => !o && setPreviewPro(null)}
      />
      <section className="bg-background">
        <div className="container-page py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Help for every home task
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Book trusted local professionals for cleaning, repairs, and more.
            </p>
          </div>
          <div className="relative mx-auto mt-8 max-w-2xl">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-accent" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try 'deep cleaning' or 'electrician'"
              className="h-14 rounded-2xl bg-surface pl-14 pr-4 text-base shadow-soft focus-visible:ring-4 focus-visible:ring-primary/20"
            />
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No services match “{q}”.</h2>
            <p className="mt-1 text-sm text-muted-foreground">Try a broader term like “clean”, “repair” or “paint”.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const catPros = providers.filter((p) => p.category_id === c.id);
              const shown = catPros.slice(0, 3);
              const extra = catPros.length - shown.length;
              return (
                <div
                  key={c.id}
                  className="flex flex-col rounded-3xl bg-surface p-6 shadow-soft transition-shadow hover:shadow-elevated"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-muted text-primary">
                      <CategoryIcon iconKey={c.icon_key} className="h-8 w-8" />
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1.5">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="text-sm font-bold text-foreground">4.9</span>
                    </div>
                  </div>

                  <h3 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground">
                    {c.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 leading-relaxed text-muted-foreground">
                    {c.tagline}
                  </p>

                  <div className="mt-auto pt-6">
                    <div className="mb-5 flex items-center justify-between">
                      <span className="text-base text-foreground">
                        Starts at <span className="font-bold">₹{c.base_price}</span>
                      </span>
                      {shown.length > 0 && (
                        <div className="flex items-center">
                          <div className="flex -space-x-2">
                            {shown.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPreviewPro(p);
                                }}
                                className="rounded-full transition-transform hover:z-10 hover:scale-110 focus:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                aria-label={`Preview ${p.full_name}`}
                              >
                                <img
                                  src={providerAvatar(p.avatar_key)}
                                  alt={p.full_name}
                                  loading="lazy"
                                  className="h-8 w-8 rounded-full border-2 border-surface object-cover"
                                />
                              </button>
                            ))}
                          </div>
                          <span className="ml-2 text-xs font-medium text-muted-foreground">
                            {extra > 0 ? `+${extra} more` : `${catPros.length} technician${catPros.length === 1 ? "" : "s"}`}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      to="/services/$slug"
                      params={{ slug: c.slug }}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    >
                      View technicians
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
