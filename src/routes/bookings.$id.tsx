import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient, useSuspenseQuery, useMutation, useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle2, Calendar, MapPin, Phone, ArrowRight, ShieldCheck, Clock, Loader2, XCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import {
  bookingByIdQuery, categoriesQuery, providersQuery, reviewByBookingQuery,
  providerPhoneQuery,
} from "@/lib/queries";
import { cancelBooking } from "@/lib/booking.functions";
import { providerAvatar } from "@/lib/assets";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";



export const Route = createFileRoute("/bookings/$id")({
  loader: async ({ context, params }) => {
    const booking = await context.queryClient.ensureQueryData(bookingByIdQuery(params.id));
    if (!booking) throw notFound();
    const [providers, cats] = await Promise.all([
      context.queryClient.ensureQueryData(providersQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
    const provider = providers.find((p) => p.id === booking.provider_id)!;
    const category = cats.find((c) => c.id === booking.category_id)!;
    return { provider, category };
  },
  head: () => ({ meta: [{ title: "Booking confirmed — UrbanFix" }, { name: "robots", content: "noindex" }] }),
  component: BookingConfirmation,
  notFoundComponent: () => (
    <div className="container-page py-24 text-center">
      <h1 className="font-display text-2xl font-semibold">Booking not found</h1>
      <Button asChild variant="link" className="mt-4"><Link to="/bookings">My bookings</Link></Button>
    </div>
  ),
});

function BookingConfirmation() {
  const { provider, category } = Route.useLoaderData();
  const params = Route.useParams();
  const { data: booking } = useSuspenseQuery(bookingByIdQuery(params.id));
  const { session } = useSession();

  if (!booking) return null;
  const isCustomer = session?.user?.id === String(booking.customer_id);
  const scheduled = new Date(booking.scheduled_at);
  const queryClient = useQueryClient();
  const payAfter = booking.payment_method === "pay_after";
  const paid = booking.stripe_payment_status === "paid";
  const confirmed = paid || payAfter;

  // Poll for a few seconds after returning from Stripe until the webhook flips payment_status
  useEffect(() => {
    if (confirmed) return;
    const start = Date.now();
    const iv = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["booking", booking.id] });
      if (Date.now() - start > 30_000) clearInterval(iv);
    }, 2000);
    return () => clearInterval(iv);
  }, [confirmed, booking.id, queryClient]);

  return (
    <section className="container-page py-14">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center text-center">
          <div className={`grid h-14 w-14 place-items-center rounded-full ${confirmed ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
            {confirmed ? <CheckCircle2 className="h-7 w-7" /> : <Clock className="h-7 w-7" />}
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {isCustomer 
              ? (confirmed ? "Your booking is confirmed" : "Payment pending")
              : `Booking ${confirmed ? "Confirmed" : "Pending"}`}
          </h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            {isCustomer
              ? (paid
                ? `We've notified ${provider.full_name.split(" ")[0]}. You'll get a confirmation SMS and email shortly.`
                : payAfter
                  ? `We've notified ${provider.full_name.split(" ")[0]}. Pay ₹${booking.total_amount} to the technician after the service.`
                  : "Complete payment to lock in your slot. We hold it for 30 minutes.")
              : (paid
                ? `Payment completed online.`
                : payAfter
                  ? `Customer will pay ₹${booking.total_amount} after the service.`
                  : "Payment is pending from the customer.")}
          </p>
          {!confirmed && isCustomer && (
            <Button asChild className="mt-5 rounded-xl">
              <Link to="/checkout/$bookingId" params={{ bookingId: booking.id }}>Complete payment</Link>
            </Button>
          )}
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border bg-surface-muted px-6 py-4 text-xs">
            <span className="font-medium uppercase tracking-widest text-muted-foreground">Booking ID</span>
            <span className="font-mono text-foreground">{booking.id.slice(0, 8).toUpperCase()}</span>
          </div>

          <div className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 border border-border">
                <AvatarImage src={providerAvatar(provider.avatar_key)} alt="" />
                <AvatarFallback>{provider.full_name.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{provider.full_name}</div>
                <div className="text-xs text-muted-foreground">{provider.headline}</div>
                <Badge variant="secondary" className="mt-2 rounded-full text-[10px] uppercase tracking-widest">
                  {category.name}
                </Badge>
              </div>
            </div>

            <ProviderCallButton
              providerId={booking.provider_id}
              providerName={provider.full_name}
              enabled={confirmed && booking.status !== "cancelled"}
            />


            <BookingStatusTracker status={booking.status} payAfter={payAfter} paid={paid} />

            <dl className="mt-6 space-y-4 border-t border-border pt-6 text-sm">
              <Row icon={<Calendar className="h-4 w-4 text-primary" />} label="Scheduled">
                {format(scheduled, "EEE, d MMM yyyy · h:mm a")}
              </Row>
              <Row icon={<MapPin className="h-4 w-4 text-primary" />} label="Address">
                {booking.address_line}, {booking.address_city} {booking.address_pincode}
              </Row>
              <Row icon={<Phone className="h-4 w-4 text-primary" />} label="Contact">
                {booking.contact_phone}
              </Row>
              {booking.notes && (
                <Row icon={<ShieldCheck className="h-4 w-4 text-primary" />} label="Notes">
                  {booking.notes}
                </Row>
              )}
            </dl>

            <div className="mt-6 rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total {paid ? "paid" : payAfter ? "due after service" : "due"}</span>
                <span>₹{booking.total_amount}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {paid
                  ? "Paid securely via card. A receipt has been emailed to you."
                  : payAfter
                    ? "Pay the technician in cash or UPI once the job is done. No advance required."
                    : "Complete payment to secure the slot. Full refund available up to 2 hours before the visit."}
              </p>
            </div>
          </div>
        </div>

        {booking.status === "completed" && (
          <ReviewSection bookingId={booking.id} providerId={booking.provider_id} providerName={provider.full_name} />
        )}

        {booking.disputed && (
          <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/5 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <XCircle className="h-4 w-4" /> Issue reported — our team is on it
            </div>
            {booking.dispute_reason && (
              <p className="mt-2 text-sm text-muted-foreground">"{booking.dispute_reason}"</p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/bookings">See all bookings</Link>
          </Button>
          {(booking.status === "pending" || booking.status === "confirmed") &&
            scheduled.getTime() > Date.now() && (
              <CancelBookingButton bookingId={booking.id} isPaid={paid} />
            )}
          {!booking.disputed && booking.status !== "cancelled" && (
            <ReportIssueButton bookingId={booking.id} />
          )}
          <Button asChild className="rounded-xl">
            <Link to="/services">Book another service <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ReviewSection({ bookingId, providerId, providerName }: { bookingId: string; providerId: string; providerName: string }) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const existing = useQuery({ ...reviewByBookingQuery(bookingId) });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to leave a review");
      if (rating < 1) throw new Error("Pick a star rating");
      if (comment.trim().length < 10) throw new Error("Write at least 10 characters");
      const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
      await api.post("/reviews", {
        bookingId,
        providerId,
        customerName: meta.full_name || user.email?.split("@")[0] || "Customer",
        customerCity: meta.city || "India",
        rating,
        comment: comment.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-by-booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Thanks for the review!");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (existing.isLoading) {
    return <div className="mt-8 h-40 animate-pulse rounded-3xl border border-border bg-surface" />;
  }

  if (existing.data) {
    return (
      <div className="mt-8 rounded-3xl border border-border bg-surface p-6">
        <div className="text-xs font-medium uppercase tracking-widest text-primary">Your review</div>
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn("h-4 w-4", i < existing.data!.rating ? "fill-warning text-warning" : "text-muted-foreground/30")} />
          ))}
        </div>
        <p className="mt-3 text-sm text-foreground">{existing.data.comment}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-3xl border border-border bg-surface p-6">
      <div className="text-xs font-medium uppercase tracking-widest text-primary">Rate your experience</div>
      <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
        How was {providerName.split(" ")[0]}?
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Your feedback helps other customers pick the right technician.</p>

      <div
        className="mt-4 flex items-center gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onClick={() => setRating(n)}
            className="rounded-md p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          >
            <Star className={cn(
              "h-7 w-7 transition-colors",
              (hover || rating) >= n ? "fill-warning text-warning" : "text-muted-foreground/40",
            )} />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Tell us what went well — punctuality, quality, communication…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mt-4 min-h-[110px] rounded-xl"
        maxLength={500}
      />
      <div className="mt-1 text-right text-xs text-muted-foreground">{comment.length}/500</div>

      <Button
        className="mt-3 w-full rounded-xl sm:w-auto"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit review"}
      </Button>
    </div>
  );
}


function CancelBookingButton({ bookingId, isPaid }: { bookingId: string; isPaid: boolean }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const mutation = useMutation({
    mutationFn: async () => {
      const result = await cancelBooking({ data: { bookingId } });
      if ("error" in result) throw new Error(result.error);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success(result.refunded ? "Booking cancelled — refund initiated" : "Booking cancelled");
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message || "Could not cancel booking"),
  });
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="rounded-xl text-destructive hover:text-destructive">
          <XCircle className="h-4 w-4" /> Cancel booking
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
          <AlertDialogDescription>
            Your slot will be released and the professional notified.
            {isPaid ? " We'll refund your card — funds land in 3–5 business days." : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Keep booking</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); mutation.mutate(); }}
            disabled={mutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Cancelling…</> : "Yes, cancel"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ProviderCallButton({
  providerId,
  providerName,
  enabled,
}: {
  providerId: string;
  providerName: string;
  enabled: boolean;
}) {
  const phoneQ = useQuery(providerPhoneQuery(providerId, enabled));
  if (!enabled) return null;
  const phone = phoneQ.data;
  if (!phone) return null;
  return (
    <a
      href={`tel:${phone}`}
      className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
    >
      <Phone className="h-4 w-4" /> Call {providerName.split(" ")[0]} · {phone}
    </a>
  );
}

function ReportIssueButton({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const mutation = useMutation({
    mutationFn: async () => {
      const trimmed = reason.trim();
      if (trimmed.length < 10) throw new Error("Please describe the issue in a bit more detail");
      await api.post(`/bookings/${bookingId}/dispute`, { reason: trimmed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      toast.success("Reported — our team will follow up");
      setOpen(false);
      setReason("");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          Report an issue
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Report an issue with this booking</AlertDialogTitle>
          <AlertDialogDescription>
            Tell us what went wrong. An admin will review your case and get back to you within 24 hours.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Describe the issue — quality, no-show, damage, billing…"
          rows={4}
          maxLength={500}
        />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); mutation.mutate(); }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : "Submit report"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-8 w-8 place-items-center rounded-lg bg-primary/10">{icon}</div>

      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  );
}

function BookingStatusTracker({
  status,
  payAfter,
  paid,
}: {
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  payAfter: boolean;
  paid: boolean;
}) {
  if (status === "cancelled") {
    return (
      <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        This booking was cancelled.
      </div>
    );
  }

  const steps = [
    { key: "booked", label: "Booked", done: true },
    { key: "confirmed", label: payAfter ? "Confirmed" : "Payment received", done: paid || payAfter || status !== "pending" },
    { key: "in_progress", label: "In progress", done: status === "in_progress" || status === "completed" },
    { key: "completed", label: "Completed", done: status === "completed" },
  ];
  let activeIdx = -1;
  for (let i = 0; i < steps.length; i++) if (steps[i].done) activeIdx = i;

  return (
    <div className="mt-6 rounded-2xl border border-border bg-background p-5">
      <div className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Service progress
      </div>
      <ol className="relative flex justify-between">
        <div className="absolute left-4 right-4 top-3 h-0.5 bg-border" aria-hidden />
        <div
          className="absolute left-4 top-3 h-0.5 bg-primary transition-all"
          style={{ width: `calc((100% - 2rem) * ${activeIdx / (steps.length - 1)})` }}
          aria-hidden
        />
        {steps.map((s, i) => {
          const isActive = i === activeIdx;
          return (
            <li key={s.key} className="relative z-10 flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full border-2 bg-background text-[10px] font-semibold",
                  s.done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
                  isActive && "ring-4 ring-primary/20",
                )}
              >
                {s.done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </div>
              <div
                className={cn(
                  "text-center text-[10px] font-medium uppercase tracking-wider",
                  s.done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {s.label}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
