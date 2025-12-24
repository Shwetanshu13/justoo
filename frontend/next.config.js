/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    outputFileTracingRoot: "..",
    async rewrites() {
        const adminApi =
            process.env.NEXT_PUBLIC_ADMIN_BACKEND_API_URL ||
            "http://localhost:3001";
        const inventoryApi =
            process.env.NEXT_PUBLIC_INVENTORY_API_URL ||
            "http://localhost:3002";
        return [
            {
                source: "/admin/api/:path*",
                destination: `${adminApi}/admin/api/:path*`,
            },
            {
                source: "/inventory/api/:path*",
                destination: `${inventoryApi}/inventory/api/:path*`,
            },
        ];
    },
    // allowedDevOrigins: [
    //     "http://localhost:3000",
    //     "http://localhost:3001",
    //     "http://localhost:3002",
    //     "http://172.20.10.5:3000",
    // ],
    // crossOrigin: "anonymous",
};

module.exports = nextConfig;
