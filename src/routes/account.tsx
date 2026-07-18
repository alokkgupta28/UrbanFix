import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CalendarClock, CheckCircle2, Wallet, ArrowRight, User, Save } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";
import { myBookingsQuery, profileQuery, type Profile } from "@/lib/queries";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account — UrbanFix" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const profileSchema = z.object({
  full_name: z.string().min(2, "Enter your full name").max(80),
  phone: z.string().min(6, "Enter a valid phone").max(20),
  city: z.string().max(60).optional().or(z.literal("")),
});
type ProfileForm = z.infer<typeof profileSchema>;

function AccountPage() {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/account" } });
  }, [loading, user, navigate]);

  const bookings = useQuery(myBookingsQuery(user?.id));
  const profile = useQuery(profileQuery(user?.id));

  if (loading || !user) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const data = bookings.data ?? [];
  const now = Date.now();
  const upcoming = data.filter(
    (b) => new Date(b.scheduled_at).getTime() >= now && b.status !== "cancelled"
  );
  const completed = data.filter((b) => b.status === "completed");
  const totalSpent = data
    .filter((b) => b.stripe_payment_status === "paid" || b.status === "completed")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  const initials = (profile.data?.full_name || user.email || "U")
    .toString()
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <section className="container-page py-12">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border">
            <AvatarImage src={profile.data?.avatar_url || ""} alt="" />
            <AvatarFallback className="bg-secondary text-secondary-foreground text-base font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-medium uppercase tracking-widest text-primary">Welcome back</div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {profile.data?.full_name || user.email?.split("@")[0]}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Button asChild className="rounded-xl">
          <Link to="/services">Book a new service <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<CalendarClock className="h-5 w-5 text-primary" />}
          label="Upcoming"
          value={upcoming.length.toString()}
          hint={upcoming.length ? "Next visit scheduled" : "No visits scheduled"}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
          label="Completed"
          value={completed.length.toString()}
          hint="Services delivered"
        />
        <StatCard
          icon={<Wallet className="h-5 w-5 text-accent" />}
          label="Total spent"
          value={`₹${totalSpent.toLocaleString("en-IN")}`}
          hint="Across all bookings"
        />
      </div>

      {/* Two column: recent bookings + profile form */}
      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold tracking-tight">Recent activity</h2>
            <Link to="/bookings" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {bookings.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-surface" />
              ))
            ) : data.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No bookings yet — <Link to="/services" className="font-medium text-primary hover:underline">explore services</Link>.
              </div>
            ) : (
              data.slice(0, 4).map((b) => (
                <Link
                  key={b.id}
                  to="/bookings/$id"
                  params={{ id: b.id }}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-all hover:shadow-soft"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium capitalize">{b.status.replace("_", " ")}</div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {new Date(b.scheduled_at).toLocaleString("en-IN", {
                        weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit",
                      })} · {b.address_city}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-sm font-semibold">₹{b.total_amount}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-display text-lg font-semibold tracking-tight">Your profile</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Keep your details up to date for faster bookings.</p>
            {profile.isLoading ? (
              <div className="mt-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : (
              <ProfileForm userId={user.id} profile={profile.data} />
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

function ProfileForm({ userId, profile }: { userId: string; profile: Profile | null | undefined }) {
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      city: profile?.city ?? "",
    },
    values: {
      full_name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      city: profile?.city ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: ProfileForm) => {
      const payload = {
        full_name: values.full_name,
        phone: values.phone,
        city: values.city || null,
      };
      await api.put("/profiles/me", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      setSaved(true);
      toast.success("Profile updated");
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (e: Error) => toast.error(e.message || "Could not save profile"),
  });

  return (
    <form
      className="mt-5 space-y-4"
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
    >
      <div>
        <Label htmlFor="full_name" className="text-xs uppercase tracking-widest text-muted-foreground">Full name</Label>
        <Input id="full_name" {...form.register("full_name")} className="mt-1.5" />
        {form.formState.errors.full_name && (
          <p className="mt-1 text-xs text-destructive">{form.formState.errors.full_name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-muted-foreground">Phone</Label>
        <Input id="phone" inputMode="tel" {...form.register("phone")} className="mt-1.5" />
        {form.formState.errors.phone && (
          <p className="mt-1 text-xs text-destructive">{form.formState.errors.phone.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="city" className="text-xs uppercase tracking-widest text-muted-foreground">City</Label>
        <Input id="city" placeholder="Optional" {...form.register("city")} className="mt-1.5" />
      </div>
      <Button
        type="submit"
        className="w-full rounded-xl"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
        ) : saved ? (
          <><CheckCircle2 className="h-4 w-4" /> Saved</>
        ) : (
          <><Save className="h-4 w-4" /> Save changes</>
        )}
      </Button>
    </form>
  );
}
