"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/admin/contexts/AuthContext";
import Sidebar from "./Sidebar";
import Header from "./Header";
import LoadingSpinner from "./LoadingSpinner";

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, loading } = useAuth();
    const router = useRouter();

    // Call hooks unconditionally to keep order stable across renders
    useEffect(() => {
        if (!loading && !user) {
            router.replace("/admin/login");
        }
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-sm text-gray-500 font-medium">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
                <div className="text-center">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-sm text-gray-500 font-medium">
                        Redirecting...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Content area with left padding for fixed sidebar on md+ */}
            <div className="md:pl-72 flex flex-col min-h-screen transition-all duration-300">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="border-t border-gray-100 bg-white/50 backdrop-blur-sm py-4 px-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500">
                        <span>© 2024 Justoo Admin. All rights reserved.</span>
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            System Online
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
