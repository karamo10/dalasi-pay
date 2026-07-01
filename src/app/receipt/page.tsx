'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Full booking record returned by `/api/receipt`, including the related service and payment.
 *
 * @property id - Unique booking identifier.
 * @property customerName - Full name of the customer.
 * @property customerEmail - Email address of the customer.
 * @property customerPhone - Phone number of the customer.
 * @property date - ISO date string for the scheduled appointment.
 * @property status - Current booking status (e.g. PENDING, CONFIRMED, CANCELLED).
 * @property service - The service that was booked.
 * @property payment - Associated payment record, or null if not yet created.
 */

type Booking = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: string;
  service: {
    name: string;
    description: string;
    duration: number;
    category: string;
  };
  payment: {
    amount: number;
    method: string;
    status: string;
    createdAt: string;
  } | null;
};

/**
 * Fetches and displays a booking receipt including customer details, service info,
 * payment status, a QR code for verification, and a WhatsApp share button.
 *
 */
function ReceiptContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided.');
      setLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const res = await fetch(`/api/receipt?bookingId=${bookingId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setBooking(data);
      } catch {
        setError('Could not load booking.');
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  const receiptUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/receipt?bookingId=${bookingId}`;

  const whatsappMessage = booking
    ? encodeURIComponent(
        `*DalasiPay Booking Receipt*\n\n` +
          `*Name:* ${booking.customerName}\n` +
          `*Service:* ${booking.service.name}\n` +
          `*Date:* ${new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}\n` +
          `*Time:* ${new Date(booking.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}\n` +
          `*Amount:* D ${booking.payment?.amount.toLocaleString()} GMD\n` +
          `*Payment:* ${booking.payment?.method} · ${booking.payment?.status}\n` +
          `*Booking ID:* ${booking.id}\n\n` +
          `Payment confirmed. See you soon!`,
      )
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading receipt...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-4">
            {error || 'Booking not found.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-white/40 text-sm hover:text-white transition-colors"
          >
            ← Back to services
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">DalasiPay</h1>
          <p className="text-xs text-white/40 mt-0.5">Booking Receipt</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-xs text-white/40 hover:text-white transition-colors border border-white/10 px-3 py-1.5"
        >
          ← Home
        </button>
      </header>

      <div className="max-w-lg mx-auto px-6 py-10 space-y-6">
        {/* Status banner */}
        <div
          className={`px-4 py-3 border text-sm font-semibold text-center ${
            booking.payment?.status === 'SUCCESS'
              ? 'border-green-400/30 bg-green-400/5 text-green-400'
              : 'border-yellow-400/30 bg-yellow-400/5 text-yellow-400'
          }`}
        >
          {booking.payment?.status === 'SUCCESS' ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 stroke-current fill-none"
                strokeWidth={2.5}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Payment Confirmed
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 stroke-current fill-none"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Payment Pending
            </span>
          )}
        </div>

        {/* Booking details */}
        <div className="border border-white/10 divide-y divide-white/10">
          <div className="px-5 py-4">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
              Booking Details
            </p>
            <div className="space-y-3">
              {[
                { label: 'Customer', value: booking.customerName },
                { label: 'Email', value: booking.customerEmail },
                { label: 'Phone', value: booking.customerPhone },
                { label: 'Service', value: booking.service.name },
                { label: 'Category', value: booking.service.category },
                {
                  label: 'Date',
                  value: new Date(booking.date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }),
                },
                {
                  label: 'Time',
                  value: new Date(booking.date).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
                {
                  label: 'Duration',
                  value:
                    booking.service.duration >= 60
                      ? `${booking.service.duration / 60}h`
                      : `${booking.service.duration}min`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-start gap-4"
                >
                  <span className="text-xs text-white/30 shrink-0">
                    {label}
                  </span>
                  <span className="text-xs text-white/80 text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment details */}
          <div className="px-5 py-4">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
              Payment
            </p>
            <div className="space-y-3">
              {[
                {
                  label: 'Amount',
                  value: `D ${booking.payment?.amount.toLocaleString()} GMD`,
                },
                { label: 'Method', value: booking.payment?.method || '—' },
                { label: 'Status', value: booking.payment?.status || '—' },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-start gap-4"
                >
                  <span className="text-xs text-white/30 shrink-0">
                    {label}
                  </span>
                  <span
                    className={`text-xs text-right font-semibold ${
                      label === 'Amount'
                        ? 'text-green-400'
                        : label === 'Status' && value === 'SUCCESS'
                          ? 'text-green-400'
                          : label === 'Status' && value === 'FAILED'
                            ? 'text-red-400'
                            : 'text-white/80'
                    }`}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking ID */}
          <div className="px-5 py-4">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
              Booking ID
            </p>
            <p className="text-xs font-mono text-white/50 break-all">
              {booking.id}
            </p>
          </div>
        </div>

        {/* QR Code */}
        <div className="border border-white/10 px-5 py-6 text-center">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-4">
            Verification QR Code
          </p>
          <div className="flex justify-center mb-3">
            <div className="bg-white p-3">
              <QRCodeSVG value={receiptUrl} size={160} level="H" />
            </div>
          </div>
          <p className="text-xs text-white/20">
            Show this QR code at the venue to verify your booking
          </p>
        </div>

        {/* WhatsApp button */}
        <a
          href={`https://wa.me/?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-black font-bold py-4 text-sm hover:bg-[#20bc5a] transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Send Receipt via WhatsApp
        </a>

        <button
          onClick={() => router.push('/')}
          className="w-full text-white/30 text-sm hover:text-white transition-colors py-2"
        >
          ← Back to services
        </button>
      </div>
    </main>
  );
}

/**
 * Receipt page entry point. Wraps `ReceiptContent` in a `Suspense` boundary
 * because it reads from `useSearchParams`.
 *
 * @returns The receipt page with a Suspense fallback loader.
 */
export default function ReceiptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <p className="text-white/40 text-sm">Loading receipt...</p>
        </div>
      }
    >
      <ReceiptContent />
    </Suspense>
  );
}
