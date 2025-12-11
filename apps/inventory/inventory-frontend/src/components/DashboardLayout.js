"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="relative min-h-screen bg-transparent">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                currentPath={pathname}
            />

            <div className="lg:pl-72">
                <Header setSidebarOpen={setSidebarOpen} user={user} />

                <main className="py-8 lg:py-12">
                    <div className="px-4 sm:px-6 lg:px-10">
                        <div className="mx-auto max-w-6xl space-y-10">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
