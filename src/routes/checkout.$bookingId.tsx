import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2, CreditCard, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createBookingCheckout, verifyPayment } from "@/lib/booking.functions";
import { openRazorpayCheckout, type RazorpaySuccessResponse } from "@/lib/razorpay";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useSession } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { bookingByIdQuery } from "@/lib/queries";

export const Route = createFileRoute("/checkout/$bookingId")({
  head: () => ({
    meta: [
      { title: "Complete payment — UrbanFix" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { bookingId } = Route.useParams();
  const { user, loading } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: booking } = useQuery(bookingByIdQuery(bookingId));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const handlePay = async () => {
    setPaying(true);
    setError(null);
    try {
      const returnUrl = `${window.location.origin}/bookings/${bookingId}`;
      const result = await createBookingCheckout({
        data: { bookingId, returnUrl },
      });

      if ("error" in result) {
        setError(result.error);
        setPaying(false);
        return;
      }

      // Mock flow — backend auto-confirmed, redirect
      if (result.orderId === "mock_order") {
        toast.success("Payment confirmed (mock mode)");
        navigate({ to: "/bookings/$id", params: { id: bookingId } });
        return;
      }

      // Open Razorpay modal
      await openRazorpayCheckout({
        orderId: result.orderId,
        amount: result.amount,
        currency: result.currency,
        bookingId,
        userName: (user as any)?.user_metadata?.full_name,
        userEmail: user?.email,
        onSuccess: async (response: RazorpaySuccessResponse) => {
          // Verify on backend
          const verifyResult = await verifyPayment({
            data: {
              bookingId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
          });

          if ("error" in verifyResult) {
            setError(verifyResult.error);
            setPaying(false);
            return;
          }

          toast.success("Payment successful!");
          navigate({ to: "/bookings/$id", params: { id: bookingId } });
        },
        onDismiss: () => {
          setPaying(false);
        },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[checkout] error:", msg);
      setError(msg);
      setPaying(false);
    }
  };

  if (loading || !user || !mounted) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <PaymentTestModeBanner />
      <section className="container-page py-10">
        <Link
          to="/bookings/$id"
          params={{ id: bookingId }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
        <div className="mx-auto mt-6 max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Complete your payment</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your booking is held for 30 minutes. Payment is refundable up to 2 hours before the visit.
          </p>

          {error && (
            <div className="mt-8 rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Order Summary */}
          <div className="mt-8 rounded-3xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Amount to pay</div>
                <div className="text-2xl font-bold">₹{booking?.total_amount ?? "..."}</div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
              <ShieldCheck className="h-4 w-4" />
              <span>Secured by Razorpay. Full refund available up to 2 hours before the visit.</span>
            </div>

            <Button
              onClick={handlePay}
              disabled={paying}
              className="mt-6 w-full rounded-xl py-6 text-base"
              size="lg"
            >
              {paying ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Processing…
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" /> Pay ₹{booking?.total_amount ?? "..."} now
                </>
              )}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
