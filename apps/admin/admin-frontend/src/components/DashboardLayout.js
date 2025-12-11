"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
            router.replace("/login");
        }
    }, [loading, user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {/* Content area with left padding for fixed sidebar on md+ */}
            <div className="md:pl-72 flex flex-col min-h-screen transition-all duration-300">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-8">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
