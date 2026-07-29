import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, ArrowRight, Sparkle, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";

const search = z.object({ redirect: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — UrbanFix" },
      { name: "description", content: "Sign in or create your UrbanFix account to book verified home professionals." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: search,
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, "Please share your name"),
});

function AuthPage() {
  const { user } = useSession();
  const { redirect } = Route.useSearch();

  useEffect(() => {
    if (user) {
      const dest = redirect && redirect.startsWith("/") ? redirect : "/";
      window.location.replace(dest);
    }
  }, [user, redirect]);

  return (
    <section className="container-page grid min-h-[calc(100vh-4rem)] items-center py-14 md:grid-cols-2 md:gap-16">
      <div className="hidden max-w-md md:block">
        <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkle className="h-4 w-4" /> UrbanFix account
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          One account. <br />Every service in your city.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Manage bookings, save addresses, and get exclusive member pricing on repeat visits.
        </p>
        <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
          <li>✦ ₹200 off your first booking</li>
          <li>✦ Priority support 7am–11pm</li>
          <li>✦ Access to top-rated technicians in your PIN code</li>
        </ul>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-soft">
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-surface-muted">
              <TabsTrigger value="signin" className="rounded-lg">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-6">
              <SignInForm redirectTo={redirect} />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignUpForm redirectTo={redirect} />
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to UrbanFix's Terms and acknowledge our Privacy Policy.
          </p>
        </div>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to home</Link>
        </div>
      </div>
    </section>
  );
}

function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", values);
      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("auth-change")); // Update session context
      toast.success("Welcome back");
      window.location.href = redirectTo ?? "/";
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Login failed");
    }
  });

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input {...form.register("email")} type="email" placeholder="you@example.com" className="pl-9" />
          </div>
          {form.formState.errors.email && <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <div className="relative mt-1.5">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-9 pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full rounded-xl" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>
    </div>
  );
}

function SignUpForm({ redirectTo }: { redirectTo?: string }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: "", password: "", fullName: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", values);
      localStorage.setItem("token", res.data.token);
      window.dispatchEvent(new Event("auth-change")); // Update session context
      toast.success("Account created");
      window.location.href = redirectTo ?? "/";
    } catch (err: any) {
      setLoading(false);
      toast.error(err.response?.data?.message || "Registration failed");
    }
  });

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Full name</label>
          <Input {...form.register("fullName")} placeholder="Your name" className="mt-1.5" />
          {form.formState.errors.fullName && <p className="mt-1 text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input {...form.register("email")} type="email" placeholder="you@example.com" className="mt-1.5" />
          {form.formState.errors.email && <p className="mt-1 text-xs text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <div className="relative mt-1.5">
            <Input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.formState.errors.password && <p className="mt-1 text-xs text-destructive">{form.formState.errors.password.message}</p>}
        </div>
        <Button type="submit" className="w-full rounded-xl" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Create account <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>
    </div>
  );
                }
