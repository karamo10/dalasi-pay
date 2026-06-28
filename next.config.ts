import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    MODEM_PAY_SECRET_KEY: process.env.MODEM_PAY_SECRET_KEY,
  },
};

export default nextConfig;
