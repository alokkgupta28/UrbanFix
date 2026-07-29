import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container-page py-20">
        <div className="grid gap-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="font-display text-3xl font-extrabold uppercase tracking-tight">
              Urban<span className="text-accent">Fix</span>
            </Link>
            <p className="mt-6 max-w-sm font-light leading-relaxed text-secondary-foreground/70">
              Curation over automation. Craftsmanship over contractors.
              A quieter way to keep the modern Indian home in good order.
            </p>
            <p className="mt-10 text-[10px] font-semibold uppercase tracking-[0.3em] text-secondary-foreground/50">
            </p>
          </div>

          <div className="md:col-span-2">
            <h5 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-secondary-foreground/50">Services</h5>
            <ul className="mt-6 space-y-3 text-sm font-light">
              <li><Link to="/services/$slug" params={{ slug: "electrician" }} className="hover:text-accent">Electrician</Link></li>
              <li><Link to="/services/$slug" params={{ slug: "plumber" }} className="hover:text-accent">Plumber</Link></li>
              <li><Link to="/services/$slug" params={{ slug: "deep-cleaning" }} className="hover:text-accent">Deep Cleaning</Link></li>
              <li><Link to="/services/$slug" params={{ slug: "ac-repair" }} className="hover:text-accent">AC Repair</Link></li>
              <li><Link to="/services" className="hover:text-accent">All services</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h5 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-secondary-foreground/50">Company</h5>
            <ul className="mt-6 space-y-3 text-sm font-light">
              <li><Link to="/" hash="how" className="hover:text-accent">How it works</Link></li>
              <li><Link to="/" hash="reviews" className="hover:text-accent">Reviews</Link></li>
              <li><Link to="/" hash="faq" className="hover:text-accent">FAQ</Link></li>
              <li><a href="mailto:hello@urbanfix.co" className="hover:text-accent">Contact</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h5 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-secondary-foreground/50">Dispatch</h5>
            <p className="mt-6 text-sm font-light text-secondary-foreground/70">
              Monthly notes on the craft of the home. No fluff.
            </p>
            <form className="mt-4 flex border-b border-secondary-foreground/30 pb-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-transparent text-sm text-secondary-foreground placeholder:text-secondary-foreground/40 outline-none"
              />
              <button className="text-[10px] font-bold uppercase tracking-[0.25em] hover:text-accent">Join</button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-secondary-foreground/10">
        <div className="container-page flex flex-col items-start justify-between gap-3 py-6 text-[10px] font-semibold uppercase tracking-[0.28em] text-secondary-foreground/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} UrbanFix Technologies</p>
        </div>
      </div>
    </footer>
  );
}
