import { prisma } from "@/src/lib/prisma";
import Link from "next/link";

const STATUS_COLORS = {
  PENDING: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
  CONFIRMED: "text-blue-400 border-blue-400/20 bg-blue-400/5",
  COMPLETED: "text-green-400 border-green-400/20 bg-green-400/5",
  CANCELLED: "text-red-400 border-red-400/20 bg-red-400/5",
};

const PAYMENT_COLORS = {
  PENDING: "text-yellow-400",
  SUCCESS: "text-green-400",
  FAILED: "text-red-400",
};

export default async function AdminPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      service: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = bookings
    .filter((b) => b.payment?.status === "SUCCESS")
    .reduce((sum, b) => sum + (b.payment?.amount || 0), 0);

  const totalBookings = bookings.length;
  const successfulPayments = bookings.filter(
    (b) => b.payment?.status === "SUCCESS"
  ).length;
  const pendingBookings = bookings.filter(
    (b) => b.status === "PENDING"
  ).length;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">DalasiPay</h1>
          <p className="text-xs text-white/40 mt-0.5">Admin Dashboard</p>
        </div>
        <Link
          href="/"
          className="text-xs text-white/40 hover:text-white transition-colors border border-white/10 px-3 py-1.5"
        >
          ← Storefront
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Total Bookings", value: totalBookings, color: "text-white" },
            { label: "Successful Payments", value: successfulPayments, color: "text-green-400" },
            { label: "Pending", value: pendingBookings, color: "text-yellow-400" },
            { label: "Total Revenue", value: `D ${totalRevenue.toLocaleString()}`, color: "text-green-400" },
          ].map((stat) => (
            <div key={stat.label} className="border border-white/10 px-4 py-4">
              <p className="text-xs text-white/30 uppercase tracking-widest mb-2">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Bookings Table */}
        <div>
          <p className="text-xs text-white/30 uppercase tracking-widest mb-4">
            All Bookings
          </p>

          <div className="space-y-2">
            {bookings.length === 0 ? (
              <div className="border border-white/10 px-6 py-10 text-center">
                <p className="text-white/30 text-sm">No bookings yet.</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-white/10 px-5 py-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    {/* Customer info */}
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{booking.customerName}</p>
                      <p className="text-white/40 text-xs mt-0.5">{booking.customerEmail}</p>
                      <p className="text-white/30 text-xs">{booking.customerPhone}</p>
                    </div>

                    {/* Service */}
                    <div className="min-w-0">
                      <p className="text-sm text-white/70">{booking.service.name}</p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {new Date(booking.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    {/* Payment */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">
                        D {booking.payment?.amount.toLocaleString() || "—"}
                      </p>
                      <p className={`text-xs mt-0.5 ${PAYMENT_COLORS[booking.payment?.status || "PENDING"]}`}>
                        {booking.payment?.method || "—"} · {booking.payment?.status || "—"}
                      </p>
                    </div>

                    {/* Booking status */}
                    <div>
                      <span className={`text-xs border px-2 py-1 ${STATUS_COLORS[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Booking ID */}
                  <p className="text-xs text-white/20 font-mono mt-2">{booking.id}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}