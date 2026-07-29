import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Search, ShieldCheck, Clock, BadgeCheck, ArrowRight,
  Star, CalendarCheck, PhoneCall, Wallet, Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { ProviderPreviewDialog } from "@/components/site/ProviderPreviewDialog";
import { categoriesQuery, providersQuery, reviewsQuery, type Provider } from "@/lib/queries";
import { providerAvatar, heroEditorialImage } from "@/lib/assets";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [
      { rel: "preload", as: "image", href: heroEditorialImage, fetchPriority: "high" } as unknown as { rel: string },
    ],
  }),
loader: async ({ context }) => {
  await context.queryClient.ensureQueryData(categoriesQuery);
},
  component: Landing,
});

const stats = [
  { value: "1.2M", label: "Homes served" },
  { value: "4.9", label: "Average rating" },
  { value: "12.4K", label: "Verified technicians" },
  { value: "48", label: "Cities" },
];

const why = [
  { icon: ShieldCheck, title: "Vetted craftsmen", body: "Every technician clears ID, skill and background checks before their first visit." },
  { icon: Wallet, title: "Transparent pricing", body: "See the fee before you book. No cash-side upsells. No surprises." },
  { icon: Clock, title: "On the minute", body: "Slots start when we say they do. If we're late, the visit fee is on us." },
  { icon: BadgeCheck, title: "30-day warranty", body: "Free re-service within thirty days if the job isn't up to standard." },
];

const steps = [
  { n: "01", title: "Select a service", body: "Ten essential categories. Clear, upfront pricing on every one." },
  { n: "02", title: "Choose your slot", body: "Same-day and next-day windows across every major metro." },
  { n: "03", title: "Sit at home", body: "Your technician arrives on time, works with care, and cleans up after." },
];

const faqs = [
  { q: "How do I know the professional is trustworthy?", a: "Every UrbanFix technician completes ID, address and skill verification before their first job. We continuously monitor ratings and remove anyone who drops below a 4.5 average." },
  { q: "What if I'm not happy with the service?", a: "Rate the visit within 48 hours. If anything's off, our team will send a specialist to redo the job at no extra cost — anytime within 30 days." },
  { q: "How is pricing decided?", a: "You see a base visit price before booking. On-site, the technician shares an itemised quote for any spares or extra work. Nothing is charged without your confirmation." },
  { q: "Can I reschedule or cancel?", a: "Yes — free of charge up to 2 hours before the slot. After that a small cancellation fee applies to compensate the professional." },
  { q: "Do you serve my city?", a: "UrbanFix operates across Bengaluru, Mumbai, Delhi NCR, Pune, Hyderabad, Chennai and 40+ other cities. Enter your PIN code at checkout to confirm." },
];

const ease = [0.22, 1, 0.36, 1] as const;

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary">§ {index}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">{children}</span>
    </div>
  );
}

function Landing() {
  const cats = useSuspenseQuery(categoriesQuery).data;
  const {
  data: technicians = [],
  isLoading: providersLoading,
} = useQuery(providersQuery);

const {
  data: revs = [],
  isLoading: reviewsLoading,
} = useQuery(reviewsQuery);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [previewPro, setPreviewPro] = useState<Provider | null>(null);

  const featured = technicians.slice(0, 3);
  const topReviews = revs.slice(0, 3);
  const catList = cats.slice(0, 10);

  return (
    <>
      <ProviderPreviewDialog
        provider={previewPro}
        open={previewPro !== null}
        onOpenChange={(o) => !o && setPreviewPro(null)}
      />

      {/* HERO */}
      <section className="relative">
        <div className="container-page grid gap-12 pt-14 pb-20 md:grid-cols-12 md:gap-12 md:pt-24 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="md:col-span-7 flex flex-col justify-center"
          >
            <SectionLabel index="I">The Art of Home Maintenance</SectionLabel>

            <h1 className="mt-8 font-display text-[13vw] font-extrabold leading-[0.85] tracking-[-0.03em] text-foreground sm:text-7xl md:text-[7.5rem]">
              Reliable help,
              <br />
              beautifully{" "}
              <span className="italic font-light text-primary">done.</span>
            </h1>

            <p className="mt-10 max-w-md text-base leading-relaxed text-muted-foreground">
              Book vetted electricians, plumbers, cleaners and salon experts.
              Transparent prices, unhurried craftsmanship, a thirty-day warranty on every job.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/services", search: { q } });
              }}
              className="mt-10 flex max-w-lg items-end gap-4 border-b-2 border-foreground pb-2"
            >
              <Search className="mb-1 h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What does your home need today?"
                className="flex-1 bg-transparent py-2 text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              <button
                type="submit"
                className="pb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground transition-colors hover:text-primary"
              >
                Find technicians →
              </button>
            </form>

            <div className="mt-10 flex items-center gap-5">
              <div className="flex -space-x-2">
                <span className="h-8 w-8 rounded-full border-2 border-background bg-primary" />
                <span className="h-8 w-8 rounded-full border-2 border-background bg-accent" />
                <span className="h-8 w-8 rounded-full border-2 border-background bg-muted" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                1.2M+ homes · 4.9 ★ from 240k reviews
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease }}
            className="md:col-span-5 relative"
          >
            <div className="relative">
              <div className="absolute -top-6 -right-6 hidden h-40 w-40 bg-surface-muted md:block" aria-hidden />
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={heroEditorialImage}
                  alt="An UrbanFix technician attending to a wall socket in a warm modern Indian living room"
                  width={720}
                  height={900}
                  loading="eager"
                  decoding="async"
                  {...({ fetchpriority: "high" } as Record<string, string>)}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-4 flex items-baseline justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                <span>Fig. 01</span>
                <span>Ravi K. · Electrical, Indiranagar</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-border">
        <div className="container-page grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="py-10 md:px-10 md:first:pl-0 md:last:pr-0">
              <div className="font-display text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                {s.value}
              </div>
              <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES — magazine contents */}
      <section className="container-page py-24 md:py-32">
        <SectionLabel index="II">The Catalogue</SectionLabel>
        <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="max-w-2xl font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-foreground md:text-6xl">
            Essential services,<br />
            <span className="italic font-light text-primary">quietly assembled.</span>
          </h2>
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-foreground"
          >
            View all services
            <span className="inline-block h-px w-8 bg-foreground transition-all group-hover:w-14" />
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 border-t border-l border-border md:grid-cols-2 lg:grid-cols-5">
          {catList.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
            >
              <Link
                to="/services/$slug"
                params={{ slug: c.slug }}
                className="group flex h-full flex-col justify-between border-b border-r border-border p-8 transition-colors hover:bg-surface-muted"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <CategoryIcon iconKey={c.icon_key} className="h-5 w-5 text-primary" />
                </div>
                <div className="mt-16">
                  <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">{c.tagline}</p>
                </div>
                {(() => {
                  const catTechnicians = technicians.filter((p) => p.category_id === c.id);
                  const shown = catTechnicians.slice(0, 4);
                  const extra = catTechnicians.length - shown.length;
                  if (shown.length === 0) return null;
                  return (
                    <div className="mt-6 flex items-center gap-2">
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
                              className="h-8 w-8 rounded-full border-2 border-background object-cover"
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {extra > 0 ? `+${extra} technicians` : `${shown.length} technician${shown.length === 1 ? "" : "s"}`}
                      </span>
                    </div>
                  );
                })()}
                <div className="mt-8 flex items-center justify-between border-t border-border pt-4 text-[10px] font-semibold uppercase tracking-[0.25em]">
                  <span className="text-muted-foreground">From <span className="text-foreground">₹{c.base_price}</span></span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS — editorial ledger on dark ground */}
      <section id="how" className="bg-secondary text-secondary-foreground">
        <div className="container-page grid gap-16 py-24 md:grid-cols-12 md:py-32">
          <div className="md:col-span-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">§ III  ·  The Process</span>
            <h2 className="mt-8 font-display text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
              A human touch,<br />in a digital service.
            </h2>
            <p className="mt-8 max-w-sm text-sm font-light leading-relaxed text-secondary-foreground/70">
              We hand-pick local craftsmen who treat your home with the respect it deserves — and we stand behind their work with a thirty-day warranty.
            </p>
          </div>

          <div className="md:col-span-7">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className={`flex items-start gap-8 py-10 ${i === 0 ? "border-t" : ""} border-b border-secondary-foreground/15`}
              >
                <span className="font-display text-3xl font-light text-accent">{s.n}</span>
                <div className="flex-1">
                  <h4 className="font-display text-xl font-bold uppercase tracking-wider">{s.title}</h4>
                  <p className="mt-2 text-sm font-light leading-relaxed text-secondary-foreground/70">{s.body}</p>
                </div>
                {i === 0 && <Search className="mt-1 h-5 w-5 text-accent" />}
                {i === 1 && <CalendarCheck className="mt-1 h-5 w-5 text-accent" />}
                {i === 2 && <PhoneCall className="mt-1 h-5 w-5 text-accent" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TECHNICIANS + WHY as facing spread */}
      <section className="container-page py-24 md:py-32">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <SectionLabel index="IV">The Standard</SectionLabel>
            <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-tight md:text-5xl">
              The details<br />
              <span className="italic font-light text-primary">others miss.</span>
            </h2>
            <div className="mt-12 space-y-8">
              {why.map((w) => (
                <div key={w.title} className="flex items-start gap-5 border-t border-border pt-6">
                  <w.icon className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={1.4} />
                  <div>
                    <h3 className="font-display text-base font-bold tracking-tight">{w.title}</h3>
                    <p className="mt-1 text-sm font-light leading-relaxed text-muted-foreground">{w.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-7">
            <div className="flex items-baseline justify-between">
              <SectionLabel index="V">Featured Craftsmen</SectionLabel>
              <Link to="/services" className="text-[10px] font-bold uppercase tracking-[0.28em] text-foreground hover:text-primary">
                See all →
              </Link>
            </div>
            <div className="mt-8 divide-y divide-border border-y border-border">
              {featured.map((p, i) => (
                <Link
                  key={p.id}
                  to="/providers/$id"
                  params={{ id: p.id }}
                  className="group grid grid-cols-12 items-center gap-4 py-6 transition-colors hover:bg-surface-muted"
                >
                  <div className="col-span-1 text-[10px] font-bold tracking-[0.28em] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <Avatar className="col-span-2 h-14 w-14 rounded-none border border-border md:h-16 md:w-16">
                    <AvatarImage src={providerAvatar(p.avatar_key)} alt="" loading="lazy" className="object-cover" />
                    <AvatarFallback className="rounded-none bg-muted">{p.full_name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="col-span-6">
                    <div className="flex items-center gap-2">
                      <div className="font-display text-lg font-bold tracking-tight">{p.full_name}</div>
                      {p.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{p.headline} · {p.city}</div>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {p.rating_avg.toFixed(2)}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS — pull quote spread */}
      <section id="reviews" className="border-y border-border bg-surface-muted/60">
        <div className="container-page py-24 md:py-32">
          <SectionLabel index="VI">Correspondence</SectionLabel>
          {topReviews[0] && (
            <blockquote className="mt-12 max-w-4xl">
              <p className="font-display text-3xl font-light leading-[1.25] tracking-tight text-foreground md:text-5xl">
                <span className="text-primary">“</span>
                {topReviews[0].comment}
                <span className="text-primary">”</span>
              </p>
              <footer className="mt-10 flex items-center gap-4">
                <Avatar className="h-10 w-10 rounded-none border border-border">
                  <AvatarFallback className="rounded-none bg-secondary text-xs text-secondary-foreground">
                    {topReviews[0].customer_name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  {topReviews[0].customer_name} · {topReviews[0].customer_city}
                </div>
              </footer>
            </blockquote>
          )}

          <div className="mt-16 grid gap-10 border-t border-border pt-10 md:grid-cols-2">
            {topReviews.slice(1).map((r) => (
              <div key={r.id}>
                <div className="flex items-center gap-1 text-warning">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-base font-light leading-relaxed text-foreground italic">
                  “{r.comment}”
                </p>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  — {r.customer_name}, {r.customer_city}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-24 md:py-28">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <SectionLabel index="VII">An Invitation</SectionLabel>
            <h2 className="mt-6 font-display text-5xl font-extrabold leading-[0.95] tracking-tight md:text-7xl">
              Book your first<br />
              <span className="italic font-light text-primary">visit at home.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm font-light text-muted-foreground">
              ₹200 off your first booking with any UrbanFix craftsman. Applied automatically at checkout.
            </p>
          </div>
          <div className="md:col-span-4 flex flex-col gap-3">
            <Button asChild size="lg" className="h-14 rounded-none bg-foreground text-background text-[11px] font-bold uppercase tracking-[0.25em] hover:bg-primary">
              <Link to="/services">Explore services →</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="h-14 rounded-none border border-border text-[11px] font-bold uppercase tracking-[0.25em]">
              <Link to="/" hash="how">Read the process</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border">
        <div className="container-page grid gap-12 py-24 md:grid-cols-12 md:py-28">
          <div className="md:col-span-4">
            <SectionLabel index="VIII">Common Queries</SectionLabel>
            <h2 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-tight md:text-5xl">
              Answered<br />plainly.
            </h2>
            <p className="mt-6 text-sm font-light text-muted-foreground">
              Still curious? <a className="border-b border-foreground text-foreground hover:text-primary" href="mailto:hello@urbanfix.co">hello@urbanfix.co</a>
            </p>
          </div>
          <div className="md:col-span-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`i${i}`} className="border-b border-border">
                  <AccordionTrigger className="py-6 text-left text-base font-medium hover:no-underline [&>svg]:hidden group">
                    <span className="mr-4 text-[10px] font-bold tracking-[0.3em] text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 font-display text-lg font-bold tracking-tight">{f.q}</span>
                    <Plus className="h-4 w-4 shrink-0 text-primary transition-transform group-data-[state=open]:rotate-45" />
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-14 text-sm font-light leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
}
