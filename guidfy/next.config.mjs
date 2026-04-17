/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
  //   domains: ['localhost','images.unsplash.com'],
  //  // Add your backend host here
  remotePatterns :[
    {
      hostname:'images.unsplash.com'
    },
    {
      hostname:'localhost'
    },
    {
      protocol: "https",
      hostname:'via.placeholder.com'
    }
  ]
  },

};

export default nextConfig;