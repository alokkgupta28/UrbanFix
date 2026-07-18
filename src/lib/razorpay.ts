/**
 * Razorpay integration helper.
 * Loads the Razorpay checkout script and opens the payment modal.
 */

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

export function getRazorpayKeyId(): string {
  if (!RAZORPAY_KEY) {
    throw new Error(
      "Razorpay is not configured for this build. Set VITE_RAZORPAY_KEY_ID to enable checkout.",
    );
  }
  return RAZORPAY_KEY;
}

export function isTestMode(): boolean {
  return !!RAZORPAY_KEY?.startsWith("rzp_test_");
}

/** Dynamically load the Razorpay checkout.js script once. */
let scriptLoaded = false;
function loadRazorpayScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Cannot load Razorpay on server"));
      return;
    }
    const existing = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existing) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
}

export type RazorpayCheckoutOptions = {
  orderId: string;
  amount: number; // in paise
  currency: string;
  bookingId: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss?: () => void;
};

export type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: () => void) => void;
    };
  }
}

export async function openRazorpayCheckout(opts: RazorpayCheckoutOptions): Promise<void> {
  await loadRazorpayScript();

  const keyId = getRazorpayKeyId();

  const options: Record<string, unknown> = {
    key: keyId,
    amount: opts.amount,
    currency: opts.currency,
    name: "UrbanFix",
    description: `Booking #${opts.bookingId.slice(0, 8).toUpperCase()}`,
    order_id: opts.orderId,
    handler: (response: RazorpaySuccessResponse) => {
      opts.onSuccess(response);
    },
    modal: {
      ondismiss: () => opts.onDismiss?.(),
      escape: true,
      confirm_close: true,
    },
    prefill: {
      name: opts.userName || "",
      email: opts.userEmail || "",
      contact: opts.userPhone || "",
    },
    theme: {
      color: "#6366f1", // primary indigo
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
}
