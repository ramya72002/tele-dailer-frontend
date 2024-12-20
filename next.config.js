/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_ZEGO_APP_ID: 1645796508,
    NEXT_PUBLIC_ZEGO_SERVER_ID: "1f37472dc745e1062e08d39003954911",
  },
  images: {
    domains: ["localhost"],
  },
};

module.exports = nextConfig;
