import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { providerAvatar } from "@/lib/assets";
import type { Provider } from "@/lib/queries";

export function ProviderPreviewDialog({
  provider,
  open,
  onOpenChange,
}: {
  provider: Provider | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {provider && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border border-border">
                  <AvatarImage src={providerAvatar(provider.avatar_key)} alt={provider.full_name} />
                  <AvatarFallback>{provider.full_name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <DialogTitle className="flex items-center gap-1.5">
                    <span className="truncate">{provider.full_name}</span>
                    {provider.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-left">
                    {provider.headline}
                  </DialogDescription>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium text-foreground">
                      <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                      {provider.rating_avg.toFixed(2)}
                      <span className="text-muted-foreground">({provider.rating_count})</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {provider.city}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" /> {provider.experience_years} yrs
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <p className="text-sm leading-relaxed text-muted-foreground">{provider.bio}</p>

            {provider.languages?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {provider.languages.map((l) => (
                  <Badge key={l} variant="secondary" className="rounded-full text-[10px]">
                    {l}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Rate</div>
                <div className="font-semibold">₹{provider.hourly_rate}/hr</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Jobs done</div>
                <div className="font-semibold">{provider.jobs_completed}</div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button asChild variant="outline" onClick={() => onOpenChange(false)}>
                <Link to="/providers/$id" params={{ id: provider.id }}>
                  View full profile
                </Link>
              </Button>
              <Button asChild onClick={() => onOpenChange(false)}>
                <Link to="/book/$providerId" params={{ providerId: provider.id }}>
                  Book now
                </Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
