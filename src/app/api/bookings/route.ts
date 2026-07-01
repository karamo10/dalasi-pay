import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import ModemPay from "modem-pay";

/** ModemPay client initialised with the secret key from the environment. */
const modemPay = new ModemPay(process.env.MODEM_PAY_SECRET_KEY!);

/**
 * Creates a new booking, initiates a ModemPay payment intent, and records the payment.
 *
 * @param req - Incoming POST request containing customer details, serviceId, date, and paymentMethod.
 * @returns JSON object with `bookingId` and `paymentUrl` on success,
 *   or an error response with status 404 (service not found) or 500.
 */
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
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/receipt?bookingId=${booking.id}`,
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