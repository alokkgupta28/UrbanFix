import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";
import { myProviderQuery, isAdminQuery } from "@/lib/queries";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";


const nav = [
  { to: "/services" as const, label: "Services" },
  { to: "/" as const, label: "How it works", hash: "how" },
  { to: "/" as const, label: "Reviews", hash: "reviews" },
  { to: "/" as const, label: "FAQ", hash: "faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useSession();
  const myProvider = useQuery(myProviderQuery(user?.id));
  const isPro = Boolean(myProvider.data);
  const adminQ = useQuery(isAdminQuery(user?.id));
  const isAdmin = Boolean(adminQ.data);
  const initials = (user?.full_name || user?.email || "U")
    .toString()
    .split(" ")
    .map((s: string) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();


  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl font-extrabold uppercase tracking-[0.02em] text-foreground">
          Urban<span className="text-primary">Fix</span>
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              hash={n.hash}
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="" />
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{user.full_name || "Account"}</div>
                  <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account">Account</Link>
                </DropdownMenuItem>
                {isPro && (
                  <DropdownMenuItem asChild>
                    <Link to="/provider">Technician dashboard</Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">Admin panel</Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link to="/bookings">My bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/services">Book a service</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    signOut();
                    window.location.href = "/";
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/services">Book a service</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-surface">
          <div className="container-page flex flex-col gap-1 py-3">
            {nav.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                hash={n.hash}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {user ? (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/account" onClick={() => setOpen(false)}>Profile</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/bookings" onClick={() => setOpen(false)}>My bookings</Link>
                  </Button>
                  {isPro && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/provider" onClick={() => setOpen(false)}>Technician dashboard</Link>
                    </Button>
                  )}
                  {isAdmin && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/admin" onClick={() => setOpen(false)}>Admin panel</Link>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="col-span-2"
                    onClick={async () => {
                      signOut();
                      window.location.href = "/";
                    }}
                  >
                    Sign out
                  </Button>
                </>
              ) : (

                <>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/auth" onClick={() => setOpen(false)}>Sign in</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/services" onClick={() => setOpen(false)}>Book</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
