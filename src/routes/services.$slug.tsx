import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BadgeCheck, MapPin, Star, ChevronLeft } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { categoriesQuery, providersQuery } from "@/lib/queries";
import { providerAvatar } from "@/lib/assets";

export const Route = createFileRoute("/services/$slug")({
  loader: async ({ context, params }) => {
    const cats = await context.queryClient.ensureQueryData(categoriesQuery);
    const cat = cats.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    context.queryClient.ensureQueryData(providersQuery);
    return { cat };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.cat.name} at home — UrbanFix` },
          { name: "description", content: loaderData.cat.description },
          { property: "og:title", content: `${loaderData.cat.name} — UrbanFix` },
          { property: "og:description", content: loaderData.cat.description },
        ]
      : [{ title: "Service — UrbanFix" }, { name: "robots", content: "noindex" }],
  }),
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Service not found</h1>
      <Button asChild variant="link" className="mt-4"><Link to="/services">Back to all services</Link></Button>
    </div>
  ),
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const providers = useSuspenseQuery(providersQuery).data.filter((p) => p.category_id === cat.id);

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="container-page py-12">
          <Link to="/services" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" /> All services
          </Link>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <CategoryIcon iconKey={cat.icon_key} className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="rounded-full">From ₹{cat.base_price}</Badge>
              </div>
              <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{cat.name}</h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">{cat.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {providers.length} technician{providers.length === 1 ? "" : "s"} available
          </h2>
          <div className="text-sm text-muted-foreground">Sorted by rating</div>
        </div>

        {providers.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
            No technicians in this category yet. Check back soon.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((p) => (
              <Link
                key={p.id}
                to="/providers/$id"
                params={{ id: p.id }}
                className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border border-border">
                    <AvatarImage src={providerAvatar(p.avatar_key)} alt="" loading="lazy" />
                    <AvatarFallback>{p.full_name.slice(0,1)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <div className="truncate text-base font-semibold">{p.full_name}</div>
                      {p.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                    </div>
                    <div className="mt-0.5 truncate text-sm text-muted-foreground">{p.headline}</div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 font-medium text-foreground">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        {p.rating_avg.toFixed(2)} <span className="text-muted-foreground">({p.rating_count})</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {p.city}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground">₹{p.hourly_rate}/hr</span> · {p.experience_years} yrs
                  </span>
                  <span className="text-primary opacity-0 transition-opacity group-hover:opacity-100">View profile →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
