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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                            <ShieldCheckIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900 tracking-tight">
                                Justoo Admin
                            </p>
                            <p className="text-sm text-slate-500">
                                Secure access for operations leads
                            </p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Welcome back
                        </h1>
                        <p className="text-slate-500">
                            Sign in to manage riders, orders, and analytics.
                        </p>
                    </div>

                    <form
                        className="space-y-5"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
                                    placeholder="Enter your username"
                                />
                                {errors.username && (
                                    <p className="mt-1 text-sm text-rose-600">
                                        {errors.username.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors pr-10"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                                    <p className="mt-1 text-sm text-rose-600">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

                        <div className="text-center text-sm text-slate-600">
                            Looking for the Inventory portal?
                            <Link
                                href="/inventory/login"
                                className="ml-1 font-semibold text-blue-700 hover:text-blue-800"
                            >
                                Switch to Inventory Login
                            </Link>
                        </div>

                        <div className="mt-4 rounded-lg bg-slate-50 p-4 text-xs text-slate-500 border border-slate-100">
                            <p className="font-semibold text-slate-700 mb-1">
                                Security Tip
                            </p>
                            <p>
                                Use your organization credentials. Sessions are
                                monitored for unusual activity.
                            </p>
                        </div>
                    </form>
                </div>

                <div className="hidden lg:block relative bg-slate-900 p-12 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">
                                Operations Command
                            </h2>
                            <p className="text-blue-100 text-lg leading-relaxed">
                                Coordinate teams, monitor orders, and keep every
                                delivery on track.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            {[
                                { label: "Live Orders", value: "312" },
                                { label: "Rider Uptime", value: "97.4%" },
                                { label: "Support SLAs", value: "15m" },
                                { label: "Regions", value: "12" },
                            ].map((stat, index) => (
                                <div
                                    key={index}
                                    className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10"
                                >
                                    <p className="text-blue-200 text-xs uppercase tracking-wider font-medium mb-1">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold">
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
