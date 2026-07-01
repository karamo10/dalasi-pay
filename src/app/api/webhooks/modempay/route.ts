import { NextRequest, NextResponse } from 'next/server';
import ModemPay from 'modem-pay';
import { prisma } from '@/src/lib/prisma';

/** ModemPay client used to verify webhook signatures and compose event details. */
const modemPay = new ModemPay(process.env.MODEM_PAY_SECRET_KEY!);

/**
 * Handles incoming ModemPay webhook events.
 *
 * Verifies the request signature using `x-modem-signature` header, then
 * processes the event type:
 * - `charge.succeeded` — marks the booking as CONFIRMED and payment as SUCCESS.
 * - `charge.failed` / `charge.cancelled` — marks the booking as CANCELLED and payment as FAILED.
 *
 * @param req - Incoming POST request from ModemPay containing the event payload and signature header.
 * @returns JSON `{ received: true }` with status 200 on valid requests,
 *   or an error response with status 400 for invalid JSON or failed signature verification.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-modem-signature') || ''; //
  const secret = process.env.MODEM_WEBHOOK_SECRET!; // use to verifyy the signature
  let rawBody;
  /*
    modem sent a req to my server webhook after finishing the payment process, the req
    came with two thing a 'signature' and 'req body'
    Signature: it proofs that the req came from modempay not someone pretending to be them
    Req Body: contains the the paymeny details
    */

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let event;
  try {
    event = modemPay.webhooks.composeEventDetails(rawBody, signature, secret);
    /*before the server do anything it has to compare the secret token 
    against the the req signature from the incoming req
    */
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    /*if the signature don't match send error msg with the 400 status code*/
  }

  /*
   after verifying the req is from modempay it always response 200 quickly, 
   then process later - cuz when it take too long modempay might think maybe the req get
   lost and send you a duplicate that might accidentally process booking twice
  */
  const response = NextResponse.json({ received: true }, { status: 200 });

  try {
    switch (event.event) {
      case 'charge.succeeded': {
        const payload = event.payload as any;
        const bookingId = payload.metadata?.bookingId;
        // it extract the bookingId from the payload to know which booking on the system is the payment belongs to

        // if the bookingId found it then queries the db with the bookingId to update the payment status to "success" 
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

            // if event type has "failed" or "cancelled" it update the booking to "cancelled" and payment to "failed"
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
