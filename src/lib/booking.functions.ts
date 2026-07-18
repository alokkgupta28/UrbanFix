import { api } from "@/lib/api";

type CreateOrderResult =
  | { orderId: string; amount: number; currency: string }
  | { error: string };

type VerifyResult = { ok: true } | { error: string };
type CancelResult = { ok: true; refunded: boolean } | { error: string };

/**
 * Create a Razorpay order for the given booking.
 * Backend returns orderId + amount + currency.
 */
export async function createBookingCheckout(args: {
  data: { bookingId: string; returnUrl: string };
}): Promise<CreateOrderResult> {
  try {
    const res = await api.post("/payments/checkout", {
      bookingId: args.data.bookingId,
      returnUrl: args.data.returnUrl,
    });
    const data = res.data;

    if (data.error) {
      return { error: data.error };
    }

    // Mock flow — backend auto-confirmed
    if (data.orderId === "mock_order") {
      return { orderId: "mock_order", amount: 0, currency: "INR" };
    }

    return {
      orderId: data.orderId,
      amount: data.amount,
      currency: data.currency,
    };
  } catch (e: any) {
    return { error: e.response?.data?.message || e.message || String(e) };
  }
}

/**
 * Verify the Razorpay payment signature after the checkout modal succeeds.
 */
export async function verifyPayment(args: {
  data: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  };
}): Promise<VerifyResult> {
  try {
    const res = await api.post("/payments/verify", args.data);
    const data = res.data;

    if (data.error) {
      return { error: data.error };
    }

    return { ok: true };
  } catch (e: any) {
    return { error: e.response?.data?.message || e.message || String(e) };
  }
}

/**
 * Cancel a booking and request refund if applicable.
 */
export async function cancelBooking(args: {
  data: { bookingId: string };
}): Promise<CancelResult> {
  try {
    const res = await api.post("/payments/cancel", args.data);
    const data = res.data;

    if (data.error) {
      return { error: data.error };
    }

    return { ok: true, refunded: !!data.refunded };
  } catch (e: any) {
    return { error: e.response?.data?.message || e.message || String(e) };
  }
}
