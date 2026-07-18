import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { toast } from "sonner";
import {
  ChevronLeft, ChevronRight, MapPin, CalendarDays, Clock, CheckCircle2, BadgeCheck, Star, Loader2,
} from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { categoriesQuery, providersQuery } from "@/lib/queries";
import { providerAvatar } from "@/lib/assets";

const schema = z.object({
  addressLine: z.string().trim().min(6, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit PIN"),
  phone: z.string().trim().regex(/^\+?\d[\d\s-]{8,14}$/, "Enter a valid phone number"),
  notes: z.string().trim().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

const slots = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
];

export const Route = createFileRoute("/book/$providerId")({
  loader: async ({ context, params }) => {
    const [providers, cats] = await Promise.all([
      context.queryClient.ensureQueryData(providersQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
    const provider = providers.find((p) => p.id === params.providerId);
    if (!provider) throw notFound();
    const category = cats.find((c) => c.id === provider.category_id)!;
    return { provider, category };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `Book ${loaderData.provider.full_name} — UrbanFix` },
          { name: "description", content: `Book ${loaderData.provider.full_name} for ${loaderData.category.name}. Pick your date, time and address.` },
          { name: "robots", content: "noindex" },
        ]
      : [{ title: "Book — UrbanFix" }, { name: "robots", content: "noindex" }],
  }),
  component: BookPage,
});

function BookPage() {
  const { provider, category } = Route.useLoaderData();
  const { user, loading } = useSession();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [slot, setSlot] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"card" | "pay_after">("card");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { addressLine: "", city: provider.city, pincode: "", phone: "", notes: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { redirect: `/book/${provider.id}` } });
    }
  }, [loading, user, navigate, provider.id]);

  // Price breakdown — kept in sync with the compute_booking_total()
  // Postgres function which is the source of truth on insert.
  const visitFee = provider.hourly_rate;
  const platformFee = Math.round(category.base_price * 0.15);
  const subtotal = visitFee + platformFee;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  const steps = ["Address", "Date & time", "Review"] as const;

  const goNext = async () => {
    if (step === 0) {
      const ok = await form.trigger();
      if (!ok) return;
    }
    if (step === 1 && (!date || !slot)) {
      toast.error("Pick a date and time slot");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const submit = async () => {
    if (!user || !date || !slot) return;
    setSubmitting(true);
    try {
      const [h, m] = slot.split(":").map(Number);
      const scheduled = new Date(date);
      scheduled.setHours(h, m, 0, 0);

      const values = form.getValues();
      const payload = {
        providerId: provider.id,
        categoryId: category.id,
        scheduledAt: scheduled.toISOString(),
        addressLine: values.addressLine,
        addressCity: values.city,
        addressPincode: values.pincode,
        contactPhone: values.phone,
        notes: values.notes || null,
        paymentMethod: payMethod,
      };
      
      const res = await api.post("/bookings", payload);
      const data = res.data;

      if (payMethod === "pay_after") {
        toast.success("Booking confirmed. Pay the technician after the service.");
        navigate({ to: "/bookings/$id", params: { id: data.id } });
      } else {
        navigate({ to: "/checkout/$bookingId", params: { bookingId: data.id } });
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const disabledDates = useMemo(
    () => (d: Date) => isBefore(d, startOfDay(new Date())),
    [],
  );

  if (loading || !user) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="container-page py-10">
      <Link to="/providers/$id" params={{ id: provider.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to profile
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Stepper */}
          <ol className="mb-8 grid grid-cols-3 gap-2">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-xs font-medium",
                    i < step && "bg-primary text-primary-foreground",
                    i === step && "bg-foreground text-background",
                    i > step && "bg-muted text-muted-foreground",
                  )}
                >
                  {i < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </span>
                <span className={cn("text-sm", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {s}
                </span>
              </li>
            ))}
          </ol>

          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
            {step === 0 && (
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">Where should we come?</h2>
                <p className="mt-1 text-sm text-muted-foreground">We share this with your professional 1 hour before the visit.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Street address</label>
                    <Input {...form.register("addressLine")} placeholder="Flat 302, Prestige Meadows, Bellandur" className="mt-1.5" />
                    {form.formState.errors.addressLine && <p className="mt-1 text-xs text-destructive">{form.formState.errors.addressLine.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <Input {...form.register("city")} className="mt-1.5" />
                    {form.formState.errors.city && <p className="mt-1 text-xs text-destructive">{form.formState.errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium">PIN code</label>
                    <Input {...form.register("pincode")} placeholder="560103" inputMode="numeric" className="mt-1.5" />
                    {form.formState.errors.pincode && <p className="mt-1 text-xs text-destructive">{form.formState.errors.pincode.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Contact number</label>
                    <Input {...form.register("phone")} placeholder="+91 98xxxxxx21" inputMode="tel" className="mt-1.5" />
                    {form.formState.errors.phone && <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium">Notes for the technician <span className="text-muted-foreground">(optional)</span></label>
                    <Textarea {...form.register("notes")} placeholder="Gate code, floor, or specifics — e.g. 'AC in the bedroom isn't cooling'." className="mt-1.5" rows={3} />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">Pick a date and time</h2>
                <p className="mt-1 text-sm text-muted-foreground">Slots start on the minute. Free rescheduling up to 2 hours before.</p>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("mt-1.5 w-full justify-start rounded-xl font-normal", !date && "text-muted-foreground")}>
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {date ? format(date, "EEE, d MMM yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={disabledDates} className="pointer-events-auto p-3" initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <div className="mt-1.5 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-3">
                      {slots.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSlot(t)}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-sm transition-colors",
                            slot === t
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background text-foreground hover:border-foreground/30",
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">Review & pay</h2>
                <p className="mt-1 text-sm text-muted-foreground">Secure checkout — you can reschedule or refund up to 2 hours before the visit.</p>

                <dl className="mt-6 divide-y divide-border rounded-2xl border border-border">
                  <Row label="Service" value={category.name} />
                  <Row label="Professional" value={provider.full_name} />
                  <Row label="Date" value={date ? format(date, "EEE, d MMM yyyy") : "-"} />
                  <Row label="Time" value={slot ?? "-"} />
                  <Row label="Address" value={`${form.getValues("addressLine")}, ${form.getValues("city")} ${form.getValues("pincode")}`} />
                  <Row label="Contact" value={form.getValues("phone")} />
                  {form.getValues("notes") && <Row label="Notes" value={form.getValues("notes")!} />}
                </dl>

                <div className="mt-6 rounded-2xl border border-border bg-background p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span>Visit fee</span>
                    <span>₹{visitFee}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span>Platform fee</span>
                    <span>₹{platformFee}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span>GST (18%)</span>
                    <span>₹{gst}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base font-semibold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Payment</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {([
                      { id: "card", title: "Pay now", desc: "Secure card payment. Full refund up to 2 hours before." },
                      { id: "pay_after", title: "Pay after service", desc: "Pay the technician in cash or UPI once the job is done." },
                    ] as const).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPayMethod(opt.id)}
                        className={cn(
                          "rounded-2xl border p-4 text-left transition-colors",
                          payMethod === opt.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-background hover:border-foreground/30",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{opt.title}</span>
                          <span
                            className={cn(
                              "grid h-4 w-4 place-items-center rounded-full border",
                              payMethod === opt.id ? "border-primary bg-primary" : "border-muted-foreground/40",
                            )}
                          >
                            {payMethod === opt.id && <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Nav */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(s - 1, 0))}
                disabled={step === 0}
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={goNext} className="rounded-xl">
                  Continue <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting} className="rounded-xl">
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> {payMethod === "pay_after" ? "Confirming…" : "Starting…"}</> : payMethod === "pay_after" ? "Confirm booking" : "Continue to payment"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Summary aside */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 border border-border">
                <AvatarImage src={providerAvatar(provider.avatar_key)} alt="" />
                <AvatarFallback>{provider.full_name.slice(0,1)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="font-semibold">{provider.full_name}</div>
                  {provider.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                </div>
                <div className="text-xs text-muted-foreground">{provider.headline}</div>
                <div className="mt-2 inline-flex items-center gap-1 text-xs">
                  <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                  <span className="font-medium">{provider.rating_avg.toFixed(2)}</span>
                  <span className="text-muted-foreground">({provider.rating_count})</span>
                </div>
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Service</dt>
                <dd className="text-right font-medium">{category.name}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">City</dt>
                <dd className="text-right font-medium inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{provider.city}</dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted-foreground">Slot</dt>
                <dd className="text-right font-medium inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {slot ? `${slot} · ${date ? format(date, "d MMM") : ""}` : "Not selected"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3 border-t border-border pt-3">
                <dt className="text-muted-foreground">Total</dt>
                <dd className="text-right text-base font-semibold">₹{total}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="max-w-[65%] text-right font-medium">{value}</dd>
    </div>
  );
}
