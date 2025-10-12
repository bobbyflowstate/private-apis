import withPWA from "next-pwa";

const isDev = process.env.NODE_ENV === "development";

const runtimeCaching = [
  {
    urlPattern: /^https:\/\/([a-z0-9-]+)\.supabase\.co\/rest\/v1\//i,
    handler: "NetworkFirst",
    options: {
      cacheName: "supabase-rest",
      networkTimeoutSeconds: 10,
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  {
    urlPattern: /^https:\/\/([a-z0-9-]+)\.supabase\.co\/storage\/v1\//i,
    handler: "NetworkFirst",
    options: {
      cacheName: "supabase-storage",
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  disable: isDev,
  register: true,
  skipWaiting: true,
  runtimeCaching,
})(nextConfig);
