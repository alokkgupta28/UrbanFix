import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Loader2, Wallet, Star, CalendarClock, CheckCircle2, ArrowRight,
  MapPin, Phone, MessageSquareQuote, BadgeCheck,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import {
  myProviderQuery, providerBookingsQuery, providerReviewsQuery,
  categoriesQuery, type Booking,
} from "@/lib/queries";
import { providerAvatar } from "@/lib/assets";

export const Route = createFileRoute("/provider")({
  head: () => ({
    meta: [
      { title: "Technician dashboard — UrbanFix" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProviderDashboard,
});

function ProviderDashboard() {
  const { user, loading } = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/provider" } });
  }, [loading, user, navigate]);

  const myProvider = useQuery(myProviderQuery(user?.id));
  const providerId = myProvider.data?.id;
  const bookings = useQuery(providerBookingsQuery(providerId));
  const reviews = useQuery(providerReviewsQuery(providerId));
  const cats = useQuery(categoriesQuery);

  if (loading || !user || myProvider.isLoading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!myProvider.data) {
    return (
      <section className="container-page py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-border p-10 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
            <BadgeCheck className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">No technician profile linked</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Find your professional profile in our directory and tap "Claim this profile"
            to unlock the technician dashboard.
          </p>
          <Button asChild className="mt-6 rounded-xl">
            <Link to="/services">Browse the directory <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    );
  }

  const provider = myProvider.data;
  const category = cats.data?.find((c) => c.id === provider.category_id);
  const data = bookings.data ?? [];
  const now = Date.now();
  const upcoming = data.filter(
    (b) => new Date(b.scheduled_at).getTime() >= now && b.status !== "cancelled" && b.status !== "completed"
  );
  const completed = data.filter((b) => b.status === "completed");
  const earnings = data
    .filter((b) => b.status === "completed" || b.stripe_payment_status === "paid")
    .reduce((s, b) => s + Number(b.total_amount || 0), 0);

  return (
    <section className="container-page py-12">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage src={providerAvatar(provider.avatar_key)} alt="" />
            <AvatarFallback>{provider.full_name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-primary">
              Technician dashboard {category && <Badge variant="secondary" className="rounded-full text-[10px]">{category.name}</Badge>}
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {provider.full_name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{provider.headline}</p>
          </div>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/providers/$id" params={{ id: provider.id }}>View public profile</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<CalendarClock className="h-5 w-5 text-primary" />} label="Upcoming" value={upcoming.length.toString()} hint="Confirmed & pending" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-success" />} label="Completed" value={completed.length.toString()} hint="All-time" />
        <StatCard icon={<Wallet className="h-5 w-5 text-accent" />} label="Earnings" value={`₹${earnings.toLocaleString("en-IN")}`} hint="Paid + completed" />
        <StatCard icon={<Star className="h-5 w-5 fill-warning text-warning" />} label="Rating" value={provider.rating_avg.toFixed(2)} hint={`${provider.rating_count} reviews`} />
      </div>

      {/* Bookings + reviews */}
      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-xl font-semibold tracking-tight">Bookings</h2>
          <div className="mt-4 space-y-3">
            {bookings.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-surface" />
              ))
            ) : data.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No bookings yet. Once customers book you, they'll show up here.
              </div>
            ) : (
              data.map((b) => (
                <BookingRow key={b.id} booking={b} />
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold tracking-tight">Reviews</h2>
            <span className="text-xs text-muted-foreground">{reviews.data?.length ?? 0} total</span>
          </div>
          <div className="mt-4 space-y-3">
            {reviews.isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-surface" />
              ))
            ) : !reviews.data || reviews.data.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                <MessageSquareQuote className="mx-auto h-5 w-5" />
                <p className="mt-2">Customer reviews will appear here after completed jobs.</p>
              </div>
            ) : (
              reviews.data.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-surface p-5">
                  <div className="flex items-center gap-1 text-warning">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">"{r.comment}"</p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {r.customer_name} · {r.customer_city} · {format(new Date(r.created_at), "d MMM yyyy")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  icon, label, value, hint,
}: { icon: React.ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}

const STATUS_META: Record<Booking["status"], { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
  confirmed: { label: "Confirmed", cls: "bg-primary/10 text-primary border-primary/20" },
  in_progress: { label: "In progress", cls: "bg-accent/15 text-accent-foreground border-accent/30" },
  completed: { label: "Completed", cls: "bg-success/15 text-success-foreground border-success/30" },
  cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground border-border" },
};

function nextAllowedStatuses(current: Booking["status"]): Booking["status"][] {
  if (current === "pending") return ["pending", "confirmed", "cancelled"];
  if (current === "confirmed") return ["confirmed", "in_progress", "cancelled"];
  if (current === "in_progress") return ["in_progress", "completed"];
  // completed, cancelled — provider cannot advance from here
  return [current];
}

function BookingRow({ booking }: { booking: Booking }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (status: Booking["status"]) => {
      await api.patch(`/bookings/${booking.id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", booking.id] });
      toast.success("Booking updated");
    },
    onError: (e: Error) => toast.error(e.message || "Update failed"),
  });

  const meta = STATUS_META[booking.status];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("rounded-full text-[10px] uppercase tracking-widest", meta.cls)}>
              {meta.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              #{booking.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold">
            {format(new Date(booking.scheduled_at), "EEE, d MMM · h:mm a")}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {booking.address_city}</span>
            <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {booking.contact_phone}</span>
          </div>
          {booking.notes && (
            <p className="mt-2 max-w-md text-xs text-muted-foreground">"{booking.notes}"</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Payout</div>
            <div className="text-sm font-semibold">₹{booking.total_amount}</div>
          </div>
          {(() => {
            const allowed = nextAllowedStatuses(booking.status);
            const canAdvance = allowed.length > 1;
            return (
              <Select
                value={booking.status}
                onValueChange={(v) => mutation.mutate(v as Booking["status"])}
                disabled={mutation.isPending || !canAdvance}
              >
                <SelectTrigger className="h-9 w-[150px] rounded-lg text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allowed.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
