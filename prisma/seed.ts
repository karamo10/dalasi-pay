import { PrismaClient, PaymentMethod, PaymentStatus, BookingStatus } from '@/lib/generated/prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding DalasiPay...");

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();

  // Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Gym Day Pass",
        description: "Full access to all gym equipment for one day.",
        price: 150,
        duration: 480,
        category: "Fitness",
      },
    }),
    prisma.service.create({
      data: {
        name: "Personal Training Session",
        description: "One-on-one session with a certified personal trainer.",
        price: 500,
        duration: 60,
        category: "Fitness",
      },
    }),
    prisma.service.create({
      data: {
        name: "City Tour - Banjul",
        description: "Guided tour of Banjul city landmarks and markets.",
        price: 800,
        duration: 180,
        category: "Tours",
      },
    }),
    prisma.service.create({
      data: {
        name: "Kachikally Crocodile Pool Visit",
        description: "Visit the sacred crocodile pool in Bakau with a local guide.",
        price: 600,
        duration: 120,
        category: "Tours",
      },
    }),
    prisma.service.create({
      data: {
        name: "Beach Yoga Session",
        description: "Morning yoga session on the beach with an experienced instructor.",
        price: 300,
        duration: 90,
        category: "Wellness",
      },
    }),
    prisma.service.create({
      data: {
        name: "Business Consultation",
        description: "One hour business strategy and planning session.",
        price: 1000,
        duration: 60,
        category: "Business",
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // Bookings with payments
  const bookingsData = [
    {
      customerName: "Lamin Jallow",
      customerEmail: "lamin.jallow@gmail.com",
      customerPhone: "+220 7123456",
      serviceIndex: 0,
      date: new Date("2025-07-01T09:00:00"),
      status: BookingStatus.CONFIRMED,
      payment: {
        amount: 150,
        method: PaymentMethod.WAVE,
        status: PaymentStatus.SUCCESS,
        modemPayRef: "MP-WAVE-001",
      },
    },
    {
      customerName: "Fatou Ceesay",
      customerEmail: "fatou.ceesay@gmail.com",
      customerPhone: "+220 7654321",
      serviceIndex: 2,
      date: new Date("2025-07-02T10:00:00"),
      status: BookingStatus.CONFIRMED,
      payment: {
        amount: 800,
        method: PaymentMethod.AFRIMONEY,
        status: PaymentStatus.SUCCESS,
        modemPayRef: "MP-AFRI-002",
      },
    },
    {
      customerName: "Ousman Touray",
      customerEmail: "ousman.touray@gmail.com",
      customerPhone: "+220 7789012",
      serviceIndex: 1,
      date: new Date("2025-07-03T08:00:00"),
      status: BookingStatus.PENDING,
      payment: {
        amount: 500,
        method: PaymentMethod.QMONEY,
        status: PaymentStatus.PENDING,
        modemPayRef: null,
      },
    },
    {
      customerName: "Aminata Bah",
      customerEmail: "aminata.bah@gmail.com",
      customerPhone: "+220 7345678",
      serviceIndex: 4,
      date: new Date("2025-07-04T07:00:00"),
      status: BookingStatus.COMPLETED,
      payment: {
        amount: 300,
        method: PaymentMethod.WAVE,
        status: PaymentStatus.SUCCESS,
        modemPayRef: "MP-WAVE-003",
      },
    },
    {
      customerName: "Modou Njie",
      customerEmail: "modou.njie@gmail.com",
      customerPhone: "+220 7901234",
      serviceIndex: 3,
      date: new Date("2025-07-05T11:00:00"),
      status: BookingStatus.CANCELLED,
      payment: {
        amount: 600,
        method: PaymentMethod.APS,
        status: PaymentStatus.FAILED,
        modemPayRef: null,
      },
    },
    {
      customerName: "Isatou Sanyang",
      customerEmail: "isatou.sanyang@gmail.com",
      customerPhone: "+220 7567890",
      serviceIndex: 5,
      date: new Date("2025-07-06T14:00:00"),
      status: BookingStatus.CONFIRMED,
      payment: {
        amount: 1000,
        method: PaymentMethod.CARD,
        status: PaymentStatus.SUCCESS,
        modemPayRef: "MP-CARD-004",
      },
    },
  ];

  for (const data of bookingsData) {
    const booking = await prisma.booking.create({
      data: {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        serviceId: services[data.serviceIndex].id,
        date: data.date,
        status: data.status,
      },
    });

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: data.payment.amount,
        method: data.payment.method,
        status: data.payment.status,
        modemPayRef: data.payment.modemPayRef,
      },
    });
  }

  console.log(`✅ Created ${bookingsData.length} bookings with payments`);
  console.log("🎉 DalasiPay seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });