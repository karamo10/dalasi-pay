"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId");
  const paymentUrl = searchParams.get("paymentUrl");

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-5">
        <h1 className="text-xl font-bold">DalasiPay</h1>
        <p className="text-xs text-white/40 mt-0.5">Booking Confirmation</p>
      </header>

      <div className="max-w-lg mx-auto px-6 py-14 text-center">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full border-2 border-green-400 flex items-center justify-center mx-auto mb-6">
          <span className="text-green-400 text-2xl">✓</span>
        </div>

        <h2 className="text-2xl font-bold mb-2">Booking Created</h2>
        <p className="text-white/40 text-sm mb-8">
          Your booking has been confirmed. Complete your payment below.
        </p>

        {/* Booking ID */}
        <div className="border border-white/10 px-4 py-3 mb-8 text-left">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-1">
            Booking ID
          </p>
          <p className="text-sm font-mono text-white/70">{bookingId}</p>
        </div>

        {/* Pay button */}
        {paymentUrl && (
          
          <a  href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-400 text-black font-bold py-4 text-sm hover:bg-green-300 transition-colors mb-4 text-center"
          >
            Complete Payment →
          </a>
        )}

        <button
          onClick={() => router.push("/")}
          className="text-white/30 text-sm hover:text-white transition-colors"
        >
          ← Back to services
        </button>
      </div>
    </main>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}