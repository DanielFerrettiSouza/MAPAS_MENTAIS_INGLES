/** @type {import('next').NextConfig} */
module.exports = {
  async redirects() {
    return [
      { source: "/pt/criar", destination: "/app", permanent: false },
      { source: "/pt/quiz", destination: "/quiz", permanent: false },
    ];
  },
};
