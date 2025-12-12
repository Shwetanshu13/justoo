"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/admin/contexts/AuthContext";
import LoadingSpinner from "@/admin/components/LoadingSpinner";
import toast from "react-hot-toast";
import {
    EyeIcon,
    EyeSlashIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";

function LoginForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, user, loading } = useAuth();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // Redirect if already logged in
    useEffect(() => {
        if (!isSubmitting && !loading && user) {
            router.replace("/admin/dashboard");
        }
    }, [isSubmitting, loading, user, router]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const result = await login(data.username, data.password);
            if (result?.user) {
                toast.success("Welcome back!");
                router.push("/admin/dashboard");
            } else {
                throw new Error("Login did not establish a session");
            }
        } catch (error) {
            const message =
                error.response?.data?.message || "Invalid credentials";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || user) {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-purple-600 text-white shadow-lg shadow-primary-500/30">
                            <ShieldCheckIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-900 tracking-tight">
                                Justoo Admin
                            </p>
                            <p className="text-sm text-gray-500">
                                Secure access for operations leads
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Welcome back
                        </h1>
                        <p className="text-gray-500">
                            Sign in to manage riders, orders, and analytics.
                        </p>
                    </div>

                    <form
                        className="space-y-5"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Username
                                </label>
                                <input
                                    {...register("username", {
                                        required: "Username is required",
                                        minLength: {
                                            value: 3,
                                            message:
                                                "Username must be at least 3 characters",
                                        },
                                    })}
                                    type="text"
                                    autoComplete="username"
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:outline-none transition-all duration-200"
                                    placeholder="Enter your username"
                                />
                                {errors.username && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: {
                                                value: 6,
                                                message:
                                                    "Password must be at least 6 characters",
                                            },
                                        })}
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        autoComplete="current-password"
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white focus:outline-none transition-all duration-200 pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                        <span className="h-1 w-1 rounded-full bg-red-500"></span>
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:from-primary-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>

                        <div className="text-center text-sm text-gray-600">
                            Looking for the Inventory portal?
                            <Link
                                href="/inventory/login"
                                className="ml-1 font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Switch to Inventory Login
                            </Link>
                        </div>

                        <div className="mt-4 rounded-xl bg-gradient-to-r from-gray-50 to-slate-50 p-4 text-xs text-gray-500 border border-gray-100">
                            <p className="font-semibold text-gray-700 mb-1 flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary-500"></span>
                                Security Tip
                            </p>
                            <p>
                                Use your organization credentials. Sessions are
                                monitored for unusual activity.
                            </p>
                        </div>
                    </form>
                </div>

                <div className="hidden lg:block relative bg-gray-900 p-12 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500 opacity-95"></div>
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-60 w-60 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-bold">
                                Operations Command
                            </h2>
                            <p className="text-white/80 text-lg leading-relaxed max-w-sm">
                                Coordinate teams, monitor orders, and keep every
                                delivery on track.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {[
                                {
                                    label: "Live Orders",
                                    value: "312",
                                    icon: "📦",
                                },
                                {
                                    label: "Rider Uptime",
                                    value: "97.4%",
                                    icon: "🚴",
                                },
                                {
                                    label: "Support SLAs",
                                    value: "15m",
                                    icon: "⚡",
                                },
                                { label: "Regions", value: "12", icon: "🌍" },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white/10 backdrop-blur-sm p-5 rounded-2xl border border-white/20 hover:bg-white/15 transition-all duration-300"
                                >
                                    <p className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-2 flex items-center gap-1.5">
                                        <span>{stat.icon}</span>
                                        {stat.label}
                                    </p>
                                    <p className="text-3xl font-bold">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return <LoginForm />;
}
