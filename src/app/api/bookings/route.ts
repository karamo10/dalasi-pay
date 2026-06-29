export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import ModemPay from "modem-pay";

const modemPay = new ModemPay(process.env.MODEM_PAY_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      serviceId,
      date,
      paymentMethod,
    } = body;

    /*Fetch service*/ 
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    /* Create booking */ 
    const booking = await prisma.booking.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        serviceId,
        date: new Date(date),
      },
    });

    /* Create payment intent via ModemPay */ 
    const paymentIntent = await modemPay.paymentIntents.create({
      amount: service.price,
      currency: "GMD",
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      title: service.name,
      description: service.description,
      metadata: {
        bookingId: booking.id,
        serviceName: service.name,
      },
    });

    /* Create payment record */ 
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: service.price,
        method: paymentMethod,
        modemPayRef: paymentIntent.data.id,
      },
    });

    return NextResponse.json({
      bookingId: booking.id,
      paymentUrl: paymentIntent.data.payment_link,
    });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}