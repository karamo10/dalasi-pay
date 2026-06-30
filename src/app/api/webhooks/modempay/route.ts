import { NextRequest, NextResponse } from 'next/server';
import ModemPay from 'modem-pay';
import { prisma } from '@/src/lib/prisma';

const modemPay = new ModemPay(process.env.MODEM_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const signture = req.headers.get('x-modem-signature') || '';
  const secret = process.env.MODEM_WEBHOOK_SECRET!;
  /*
    every webhook modempay send include a special header x-modem-signature.
    this a cryptographic fingerprint of the payload, created using my webhook
    secret,. we pull it out so we verify that
    */

  let rawBody;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let event;
  try {
    event = modemPay.webhooks.composeEventDetails(rawBody, signture, secret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // always res 200 quickly, then process later
  const response = NextResponse.json({ received: true }, { status: 200 });

  try {
    switch (event.event) {
      case 'charge.succeeded': {
        const payload = event.payload as any;
        const bookingId = payload.metadata?.bookingId;

        if (bookingId) {
          await prisma.payment.update({
            where: { bookingId },
            data: { status: 'SUCCESS' },
          });

          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' },
          });

          console.log(`Booking ${bookingId} confirmed via webhook`);
        }
        break;
      }

      case 'charge.failed':
      case 'charge.cancelled': {
        const payload = event.payload as any;
        const bookingId = payload.metadata?.bookingId;

        if (bookingId) {
          await prisma.payment.update({
            where: { bookingId },
            data: { status: 'FAILED' },
          });

          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CANCELLED' },
          });

          console.log(`Booking ${bookingId} marked failed via webhook`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }
  } catch (err) {
    console.error('Webhook processing error:', err);
  }

  return response;
}
