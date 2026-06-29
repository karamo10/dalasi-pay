import Link from 'next/link';
import { prisma } from '../lib/prisma';
import Image from 'next/image';

export default async function HomePage() {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { category: 'asc' },
  });

  const categories = [...new Set(services.map((s) => s.category))];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">DalasiPay</h1>
          <p className="text-xs text-white/40 mt-0.5">Book & Pay in GMD</p>
        </div>
        <Link
          href="/book"
          className="text-xs text-white/40 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded"
        >
          Book
        </Link>
      </header>

      <section className="px-6 py-14 border-b border-white/10">
        <p className="text-xs tracking-widest text-green-400 uppercase mb-3">
          Powered by ModemPay
        </p>
        <h2 className="text-4xl font-bold leading-tight max-w-md">
          Book any service. <br /> Pay with Wave, APS, Afrimoney & more.
        </h2>
        <p className="text-white/50 mt-4 max-w-sm text-sm leading-relaxed">
          Choose a service below, fill in your details, and complete your
          booking in seconds using your preferred Gambian payment method
        </p>
      </section>

      {/* Services */}
      <section className="px-6 py-10">
        {categories.map((category) => (
          <div key={category} className="mb-10">
            <p className="text-xs tracking-widest text-white/30 uppercase mb-4">
              {category}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {services
                .filter((s) => s.category === category)
                .map((service) => (
                  <Link
                    key={service.id}
                    href={`/book?serviceId=${service.id}`}
                    className="group border border-white/10 p-5 hover:border-green-400/50 hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-sm group-hover:text-green-400 transition-colors">
                        {service.name}
                      </h3>
                      <span className="text-green-400 font-bold text-sm ml-4 shrink-0">
                        D {service.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/20">
                        {service.duration >= 60
                          ? `${service.duration / 60}h`
                          : `${service.duration}min`}
                      </span>
                      <span className="text-xs text-white/30 group-hover:text-green-400 transition-colors">
                        Book →
                      </span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </section>

      {/* Payment methods */}
      <section className="px-6 py-8 border-t border-white/10">
        <p className="text-xs text-white/20 uppercase tracking-widest mb-3">
          Accepted payments
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {[
            { name: 'Wave', file: 'wave.png' },
            { name: 'APS', file: 'APS.svg' },
            { name: 'Afrimoney', file: 'afrimoney.png' },
            { name: 'Qmoney', file: 'qmoney.png' },
            { name: 'Card', file: 'mastercard.png' },
          ].map((method) => (
            <div
              key={method.name}
              className="flex items-center gap-2 border border-white/10 px-3 py-2 hover:border-white/20 transition-colors"
            >
              <Image
                src={`/payments/${method.file}`}
                alt={method.name}
                width={40}
                height={20}
                style={{ width: "auto", height: "20px" }}
              />

              <span className="text-xs text-white/40">{method.name}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
