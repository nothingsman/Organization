/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GOOGLE_MAPS_PLATFORM_KEY: process.env.GOOGLE_MAPS_PLATFORM_KEY,
  },
}

export default nextConfig
