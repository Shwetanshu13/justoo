import Link from "next/link";

export default function HomePage() {
    const links = [
        {
            href: "/admin/login",
            title: "Admin Portal",
        },
        {
            href: "/inventory/login",
            title: "Inventory Portal",
        },
    ];

    const highlights = [
        { label: "Teams Online", value: "3" },
        { label: "Cities Live", value: "12" },
        { label: "Avg. Response", value: "1.8m" },
        { label: "Reliability", value: "99.9%" },
    ];

    return (
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="hidden lg:block relative bg-slate-900 p-12 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold">
                                Justoo Control Center
                            </h1>
                            <p className="text-blue-100 text-lg leading-relaxed">
                                Choose the workspace that fits your flow. Admin
                                for people, policies, and oversight; Inventory
                                for products, stock, and fulfillment.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            {highlights.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10"
                                >
                                    <p className="text-blue-200 text-xs uppercase tracking-wider font-medium mb-1">
                                        {item.label}
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-8 lg:p-12 space-y-8">
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-blue-700 uppercase tracking-[0.2em]">
                            Control Center
                        </p>
                        <h2 className="text-3xl font-bold text-slate-900">
                            Choose a workspace
                        </h2>
                        <p className="text-slate-600 max-w-xl">
                            One domain, two dashboards. Pick the portal you want
                            to open and get straight to work.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition duration-200 hover:-translate-y-0.5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-2">
                                        <p className="text-base font-semibold text-slate-900">
                                            {link.title}
                                        </p>
                                    </div>
                                    <span className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-semibold border border-blue-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition">
                                        →
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
