/** @type {import('next').NextConfig} */
module.exports = {
  images: { remotePatterns: [{ protocol: "https", hostname: "dvmubofaprghekxcisdr.supabase.co" }] },
  async headers() {
    return [{ source: "/metodo/:file(.+\\.(?:webp|jpg))", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
  async redirects() {
    return [
      { source: "/pt/criar", destination: "/app/criar", permanent: false },
      { source: "/pt/quiz", destination: "/quiz", permanent: false },
    ];
  },
};
