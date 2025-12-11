import Link from "next/link";

export default function HomePage() {
    const links = [
        {
            href: "/admin/login",
            title: "Admin Portal",
            desc: "Manage super admin workflows, riders, orders, and analytics.",
        },
        {
            href: "/inventory/login",
            title: "Inventory Portal",
            desc: "Control items, orders, and operational reporting.",
        },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-6 py-16">
            <div className="max-w-4xl w-full space-y-8">
                <div className="space-y-3 text-center">
                    <p className="text-sm uppercase tracking-[0.4em] text-slate-300">Justoo Control Center</p>
                    <h1 className="text-3xl md:text-4xl font-bold">Choose a workspace</h1>
                    <p className="text-slate-300 max-w-2xl mx-auto">
                        One domain, two dashboards. Pick the portal you want to open.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group block rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-lg font-semibold">{link.title}</p>
                                    <p className="text-slate-200 text-sm mt-2 leading-relaxed">{link.desc}</p>
                                </div>
                                <span className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
                                    →
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
