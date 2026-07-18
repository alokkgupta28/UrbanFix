import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, MapPin, Star, ChevronLeft, Briefcase, Award, Languages, Loader2, ShieldCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { categoriesQuery, providersQuery, reviewsQuery, myProviderQuery, type Provider } from "@/lib/queries";
import { providerAvatar } from "@/lib/assets";


export const Route = createFileRoute("/providers/$id")({
  loader: async ({ context, params }) => {
    const [providers, cats] = await Promise.all([
      context.queryClient.ensureQueryData(providersQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
    const provider = providers.find((p) => p.id === params.id);
    if (!provider) throw notFound();
    const category = cats.find((c) => c.id === provider.category_id)!;
    context.queryClient.ensureQueryData(reviewsQuery);
    return { provider, category };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.provider.full_name} — ${loaderData.category.name} on UrbanFix` },
          { name: "description", content: loaderData.provider.bio },
          { property: "og:title", content: `${loaderData.provider.full_name} — UrbanFix` },
          { property: "og:description", content: loaderData.provider.bio },
        ]
      : [{ title: "Professional — UrbanFix" }, { name: "robots", content: "noindex" }],
  }),
  component: ProviderProfile,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Professional not found</h1>
      <Button asChild variant="link" className="mt-4"><Link to="/services">Browse services</Link></Button>
    </div>
  ),
});

function ProviderProfile() {
  const { provider, category } = Route.useLoaderData();
  const reviews = useSuspenseQuery(reviewsQuery).data.filter((r) => r.provider_id === provider.id);
  const { user } = useSession();
  const myProvider = useQuery(myProviderQuery(user?.id));
  const isMine = myProvider.data?.id === provider.id;
  const canClaim = !!user && !provider.user_id && !myProvider.data;



  return (
    <section className="container-page py-10">
      <Link to="/services/$slug" params={{ slug: category.slug }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> {category.name}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar className="h-24 w-24 border border-border">
                <AvatarImage src={providerAvatar(provider.avatar_key)} alt="" />
                <AvatarFallback className="text-xl">{provider.full_name.slice(0,1)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-3xl font-semibold tracking-tight">{provider.full_name}</h1>
                  {provider.verified && (
                    <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-muted-foreground">{provider.headline}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    {provider.rating_avg.toFixed(2)}
                    <span className="text-muted-foreground">({provider.rating_count} reviews)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="h-4 w-4" /> {provider.city}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Briefcase className="h-4 w-4" /> {provider.jobs_completed}+ jobs
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Experience</div>
                <div className="mt-1 flex items-center gap-2 text-lg font-semibold">
                  <Award className="h-4 w-4 text-primary" /> {provider.experience_years} years
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Rate</div>
                <div className="mt-1 text-lg font-semibold">₹{provider.hourly_rate}<span className="text-sm text-muted-foreground font-normal">/hr</span></div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Languages</div>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <Languages className="h-4 w-4 text-primary" />
                  <span className="truncate">{provider.languages.join(", ")}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-lg font-semibold tracking-tight">About {provider.full_name.split(" ")[0]}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{provider.bio}</p>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-8 rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Customer reviews</h2>
              <span className="text-sm text-muted-foreground">{reviews.length} shown</span>
            </div>
            {reviews.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">
                This technician is new to public reviews on UrbanFix — earlier ratings come from private post-job feedback.
              </p>
            ) : (
              <ul className="mt-6 divide-y divide-border">
                {reviews.map((r) => (
                  <li key={r.id} className="py-5 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-1 text-warning">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed">“{r.comment}”</p>
                    <div className="mt-2 text-xs text-muted-foreground">{r.customer_name} · {r.customer_city}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sticky booking / owner card */}
        <aside className="lg:sticky lg:top-24 lg:h-fit space-y-4">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{category.name}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-semibold">₹{provider.hourly_rate}</span>
              <span className="text-sm text-muted-foreground">/ visit fee</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Includes diagnostics. Any spares are quoted transparently on-site.
            </p>

            {isMine ? (
              <Button asChild size="lg" className="mt-6 w-full rounded-xl">
                <Link to="/provider">Open technician dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="mt-6 w-full rounded-xl">
                <Link to="/book/$providerId" params={{ providerId: provider.id }}>Book {provider.full_name.split(" ")[0]}</Link>
              </Button>
            )}

            <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> Free cancellation up to 2 hrs before</li>
              <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> 30-day service warranty</li>
              <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-primary" /> Cashless & pay-after-service</li>
            </ul>
          </div>

          {canClaim && <ClaimProviderCard provider={provider} />}
        </aside>

      </div>
    </section>
  );
}

function ClaimProviderCard({ provider }: { provider: Provider }) {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      await api.post(`/providers/${provider.id}/claim`);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["providers"] }),
        queryClient.invalidateQueries({ queryKey: ["my-provider"] }),
      ]);
      toast.success("Profile claimed — welcome to your technician dashboard");
      navigate({ to: "/provider" });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="rounded-3xl border border-dashed border-primary/40 bg-primary/5 p-6">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
        <ShieldCheck className="h-4 w-4" /> Is this you?
      </div>
      <h3 className="mt-2 font-display text-lg font-semibold tracking-tight">Claim this profile</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Link this profile to your account to manage your bookings, respond to reviews, and track earnings.
      </p>
      <Button
        variant="outline"
        className="mt-4 w-full rounded-xl border-primary/40 bg-background"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Claiming…</> : "Claim this profile"}
      </Button>
    </div>
  );
}

