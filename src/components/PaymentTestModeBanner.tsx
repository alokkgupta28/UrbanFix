import { isTestMode } from "@/lib/razorpay";

const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

export function PaymentTestModeBanner() {
  if (!razorpayKey) {
    return (
      <div className="w-full border-b border-red-300 bg-red-100 px-4 py-2 text-center text-sm text-red-800">
        Payment gateway is not configured. Set VITE_RAZORPAY_KEY_ID to enable checkout.
      </div>
    );
  }
  if (isTestMode()) {
    return (
      <div className="w-full border-b border-orange-300 bg-orange-100 px-4 py-2 text-center text-sm text-orange-800">
        Razorpay is in <strong>test mode</strong>. Use UPI ID <span className="font-mono">success@razorpay</span> or card{" "}
        <span className="font-mono">4111 1111 1111 1111</span>, any future date, any CVV.
      </div>
    );
  }
  return null;
}
