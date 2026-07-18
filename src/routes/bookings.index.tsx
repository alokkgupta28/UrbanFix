import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  categoriesQuery, providersQuery, myBookingsQuery, type Booking,
} from "@/lib/queries";
import { useSession } from "@/lib/session";
import { providerAvatar } from "@/lib/assets";

export const Route = createFileRoute("/bookings/")({
  head: () => ({
    meta: [
      { title: "My bookings — UrbanFix" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(categoriesQuery);
    context.queryClient.ensureQueryData(providersQuery);
  },
  component: BookingsList,
});

function BookingsList() {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/bookings" } });
  }, [loading, user, navigate]);

  const bookings = useQuery(myBookingsQuery(user?.id));
  const cats = useQuery(categoriesQuery);
  const technicians = useQuery(providersQuery);

  if (loading || !user) {
    return <div className="container-page flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const data = bookings.data ?? [];

  return (
    <section className="container-page py-12">
      <div className="flex flex-col gap-2">
        <div className="text-sm font-medium uppercase tracking-widest text-primary">Your account</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">My bookings</h1>
        <p className="text-muted-foreground">Track your upcoming and past service visits.</p>
      </div>

      <div className="mt-10">
        {bookings.isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-border bg-surface" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-14 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground">
              <Calendar className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No bookings yet</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
              You haven't booked a service yet. Browse categories and pick a technician to get started.
            </p>
            <Button asChild className="mt-6 rounded-xl">
              <Link to="/services">Explore services <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4">
            {data.map((b) => {
              const p = technicians.data?.find((x) => x.id === b.provider_id);
              const c = cats.data?.find((x) => x.id === b.category_id);
              return (
                <li key={b.id}>
                  <Link
                    to="/bookings/$id"
                    params={{ id: b.id }}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-5 transition-all hover:shadow-soft sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border border-border">
                        {p ? <AvatarImage src={providerAvatar(p.avatar_key)} alt="" /> : null}
                        <AvatarFallback>{p?.full_name.slice(0,1) ?? "P"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">{p?.full_name ?? "Professional"}</div>
                          <StatusBadge status={b.status} />
                        </div>
                        <div className="mt-0.5 text-sm text-muted-foreground">{c?.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {format(new Date(b.scheduled_at), "EEE, d MMM yyyy · h:mm a")} · {b.address_city}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-xs text-muted-foreground">Total</div>
                        <div className="font-semibold">₹{b.total_amount}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const map: Record<Booking["status"], { label: string; cls: string; icon?: React.ReactNode }> = {
    pending: { label: "Pending", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
    confirmed: { label: "Confirmed", cls: "bg-primary/10 text-primary border-primary/20", icon: <CheckCircle2 className="h-3 w-3" /> },
    in_progress: { label: "In progress", cls: "bg-accent/15 text-accent-foreground border-accent/30" },
    completed: { label: "Completed", cls: "bg-success/15 text-success-foreground border-success/30" },
    cancelled: { label: "Cancelled", cls: "bg-muted text-muted-foreground border-border" },
  };
  const m = map[status];
  return (
    <Badge variant="outline" className={cn("rounded-full text-[10px] uppercase tracking-widest", m.cls)}>
      {m.icon} {m.label}
    </Badge>
  );
}
