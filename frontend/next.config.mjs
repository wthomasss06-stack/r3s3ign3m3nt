import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Kiosque/reception : la page visiteur doit re-servir depuis le cache si le
      // reseau de l'etablissement flanche apres le premier chargement.
      urlPattern: /^\/v\/.*/,
      handler: "NetworkFirst",
      options: { cacheName: "visitor-form-pages", networkTimeoutSeconds: 4 },
    },
    {
      urlPattern: /\.(?:woff2?|ttf|eot)$/,
      handler: "CacheFirst",
      options: { cacheName: "fonts" },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default withPWA(nextConfig);
