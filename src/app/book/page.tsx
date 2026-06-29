'use client';

import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

type Service = {
  id: string;
  name: string;
  price: number;
  duration: number;
  category: string;
  description: string;
};

const PAYMENT_METHODS = [
  {
    id: 'WAVE',
    label: 'Wave',
    file: 'wave.png',
  },
  {
    id: 'AFRIMONEY',
    label: 'Afrimoney',
    file: 'afrimoney.png',
  },
  {
    id: 'QMONEY',
    label: 'QMoney',
    file: 'qmoney.png',
  },
  {
    id: 'APS',
    label: 'APS',
    file: 'APS.svg',
  },
  {
    id: 'CARD',
    label: 'Card',
    file: 'mastercard.png',
  },
];

function BookingForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceId = searchParams.get('serviceId');

  const [service, setService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    serviceId: serviceId || '',
    date: '',
    time: '',
    paymentMethod: '',
  });

  useEffect(() => {
    async function fetchServices() {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
      if (serviceId) {
        const found = data.find((s: Service) => s.id === serviceId);
        setService(found || null);
        setForm((prev) => ({ ...prev, serviceId }));
      }
      setLoading(false);
    }
    fetchServices();
  }, [serviceId]);

  const handleServiceChange = (id: string) => {
    const found = services.find((s) => s.id === id) || null;
    setService(found);
    setForm((prev) => ({ ...prev, serviceId: id }));
  };

  const handleSubmit = async () => {
    setError('');
    if (
      !form.customerName ||
      !form.customerEmail ||
      !form.customerPhone ||
      !form.serviceId ||
      !form.date ||
      !form.time ||
      !form.paymentMethod
    ) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date: new Date(`${form.date}T${form.time}`).toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Booking failed');

      router.push(
        `/confirmation?bookingId=${data.bookingId}&paymentUrl=${encodeURIComponent(data.paymentUrl)}`,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-5 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          ← Back
        </button>
        <div>
          <h1 className="text-lg font-bold">Book a Service</h1>
          <p className="text-xs text-white/30">
            Fill in your details to confirm
          </p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-10 space-y-8">
        {/* Service selector */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-widest block mb-2">
            Service
          </label>
          <select
            value={form.serviceId}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-green-400/50"
          >
            <option value="" disabled>
              Select a service
            </option>
            {services.map((s) => (
              <option key={s.id} value={s.id} className="bg-black">
                {s.name} — D {s.price.toLocaleString()}
              </option>
            ))}
          </select>

          {service && (
            <div className="mt-3 border border-white/5 bg-white/[0.02] px-4 py-3">
              <p className="text-xs text-white/40 leading-relaxed">
                {service.description}
              </p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-green-400 font-bold">
                  D {service.price.toLocaleString()}
                </span>
                <span className="text-xs text-white/20">
                  {service.duration >= 60
                    ? `${service.duration / 60}h`
                    : `${service.duration}min`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Customer details */}
        <div className="space-y-4">
          <p className="text-xs text-white/40 uppercase tracking-widest">
            Your Details
          </p>

          {[
            {
              key: 'customerName',
              label: 'Full Name',
              type: 'text',
              placeholder: 'Lamin Jallow',
            },
            {
              key: 'customerEmail',
              label: 'Email',
              type: 'email',
              placeholder: 'lamin@gmail.com',
            },
            {
              key: 'customerPhone',
              label: 'Phone Number',
              type: 'tel',
              placeholder: '+220 7123456',
            },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="text-xs text-white/30 block mb-1.5">
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-green-400/50"
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-xs text-white/40 uppercase tracking-widest">
            Date & Time
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/30 block mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-green-400/50"
              />
            </div>
            <div>
              <label className="text-xs text-white/30 block mb-1.5">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, time: e.target.value }))
                }
                className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-3 focus:outline-none focus:border-green-400/50"
              />
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">
            Payment Method
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                onClick={() =>
                  setForm((prev) => ({ ...prev, paymentMethod: method.id }))
                }
                className={`flex items-center gap-2 border border-white/10 px-2 py-2 md:px-3
                  ${form.paymentMethod === method.id 
                  ? `bg-blue-500`
                  : "border-white/10 text-white/30 hover:border-white/20"
                  }
                  `}
              >
                <Image
                  src={`/payments/${method.file}`}
                  alt={method.label}
                  width={40}
                  height={20}
                  style={{ width: 'auto', height: '20px' }}
                />
                <span className="text-xs font-semibold text-white/40">{method.label}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-xs border border-red-400/20 px-4 py-3">
            {error}
          </p>
        )}

        {/* Summary */}
        {service && form.paymentMethod && (
          <div className="border border-white/10 px-4 py-4 space-y-2">
            <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
              Summary
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-white/50">{service.name}</span>
              <span className="text-white">
                D {service.price.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/30">Payment via</span>
              <span className="text-white/50">
                {
                  PAYMENT_METHODS.find((m) => m.id === form.paymentMethod)
                    ?.label
                }
              </span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between">
              <span className="text-xs text-white/30">Total</span>
              <span className="text-green-400 font-bold">
                D {service.price.toLocaleString()} GMD
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-green-400 text-black font-bold py-4 text-sm hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Processing...' : 'Confirm & Pay'}
        </button>
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      }
    >
      <BookingForm />
    </Suspense>
  );
}
