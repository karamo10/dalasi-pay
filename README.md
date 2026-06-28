# DalasiPay 🇬🇲

A full-stack booking and payment demo app built for Gambian businesses. Customers can browse services, make bookings, and pay using local payment methods — Wave, Afrimoney, QMoney, APS, and Card — powered by [ModemPay](https://modempay.com).

Built as a portfolio demo to show local businesses what a modern booking + payment system looks like in practice.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL (local) |
| ORM | Prisma 7 |
| Payments | ModemPay |
| Deployment | Vercel |

---

## Features

- Browse services grouped by category with GMD pricing
- Book a service with date, time, and customer details
- Pay via Wave, APS, Afrimoney, QMoney, or Card
- Confirmation page with direct ModemPay checkout link
- Admin dashboard with booking stats and payment statuses
- Seeded with demo data

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL running locally
- pnpm installed (`npm install -g pnpm`)
- A [ModemPay](https://modempay.com) account with API keys

### Installation

```bash
# Clone the repo
git clone https://github.com/karamo10/dalasi-pay.git
cd dalasi-pay

# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file at the root:

```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/dalasipay

MODEM_PAY_API_KEY=pk_test_your_public_key
MODEM_PAY_SECRET_KEY=sk_test_your_secret_key
```

> Get your API keys from the [ModemPay Developer Dashboard](https://merchant.modempay.com/developers)

### Database Setup

```bash
# Run migrations
pnpx prisma migrate dev --name init

# Generate Prisma client
pnpx prisma generate

# Seed with demo data
pnpx prisma db seed
```

### Run the App

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
dalasi-pay/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Services listing (home)
│   │   ├── book/
│   │   │   └── page.tsx          # Booking form
│   │   ├── confirmation/
│   │   │   └── page.tsx          # Booking confirmation + payment link
│   │   ├── admin/
│   │   │   └── page.tsx          # Admin dashboard
│   │   └── api/
│   │       ├── services/
│   │       │   └── route.ts      # GET all services
│   │       └── bookings/
│   │           └── route.ts      # POST create booking + payment intent
│   └── lib/
│       └── prisma.ts             # Prisma client singleton
├── lib/
│   └── generated/
│       └── prisma/               # Auto-generated Prisma client
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Demo seed data
│   └── migrations/               # Migration history
└── prisma.config.ts              # Prisma 7 config (DB connection)
```

---

## Database Schema

```
Service     → name, description, price (GMD), duration, category
Booking     → customer details, service, date, status
Payment     → amount, method, status, ModemPay reference
```

**Payment methods:** `WAVE` · `APS` · `QMONEY` · `AFRIMONEY` · `CARD`

**Booking statuses:** `PENDING` · `CONFIRMED` · `COMPLETED` · `CANCELLED`

**Payment statuses:** `PENDING` · `SUCCESS` · `FAILED`

---

## Payment Flow

```
Customer selects service
        ↓
Fills booking form + chooses payment method
        ↓
POST /api/bookings
  → Creates booking in DB
  → Creates ModemPay payment intent
  → Saves payment record
        ↓
Redirected to confirmation page
        ↓
Clicks "Complete Payment"
        ↓
ModemPay hosted checkout (Wave/APS/QMoney/Afrimoney/Card)
        ↓
Payment success → transaction complete
```

---

## Admin Dashboard

Visit `/admin` to see:

- Total bookings
- Successful payments count
- Pending bookings
- Total revenue in GMD
- Full booking list with customer info, service, payment method, and status

---

## Deployment

This app is optimized for [Vercel](https://vercel.com). After pushing to GitHub:

1. Import the repo on Vercel
2. Add your environment variables in the Vercel dashboard
3. Deploy

> For production, switch your ModemPay keys from `sk_test_` to `sk_live_` and ensure your business has a verified ModemPay merchant account.

---

## Notes for Reviewers

- This is a **portfolio demo** - not a production app
- Test mode is active by default (no real money moves)
- The `prisma.config.ts` pattern is required for **Prisma 7** - the `url` field is no longer in `schema.prisma`
- `globalThis` pattern in `src/lib/prisma.ts` prevents multiple Prisma Client instances during Next.js hot reload
- ModemPay SDK types use flat `customer_name`, `customer_email`, `customer_phone` fields — not a nested `customer` object

---

## Author

**Karamo Camara** · Csaydimba  
### GitHub: [@karamo10](https://github.com/karamo10)  
Instagram: [@devcamz](https://instagram.com/dev.camz)  
Twitter(X): [@pabicamz](https://x.com/pabicamz) 
---

