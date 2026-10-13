/** @type {import('next').NextConfig} */
module.exports = {
  images: { remotePatterns: [{ protocol: "https", hostname: "dvmubofaprghekxcisdr.supabase.co" }] },
  async redirects() {
    return [
      { source: "/pt/criar", destination: "/app/criar", permanent: false },
      { source: "/pt/quiz", destination: "/quiz", permanent: false },
    ];
  },
};
