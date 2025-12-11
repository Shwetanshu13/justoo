"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await login(data.username, data.password);
            toast.success("Login successful!");
            router.push("/dashboard");
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
            setError("root", { message });
        } finally {
            setIsLoading(false);
        }
    };

    const liveStats = [
        { label: "In Stock", value: "1,482", color: "bg-white/90" },
        { label: "Low Stock Alerts", value: "23", color: "bg-white/80" },
        { label: "Order Fill Rate", value: "98.3%", color: "bg-white/85" },
        { label: "Avg. Lead Time", value: "2.4d", color: "bg-white/70" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M3 7l9-5 9 5-9 5-9-5zm0 6l9 5 9-5"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-lg font-bold text-slate-900 tracking-tight">
                                Justoo Inventory
                            </p>
                        </div>
                    </div>
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Welcome back
                        </h1>
                        <p className="text-slate-500">
                            Please enter your details to sign in.
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

                        {errors.root && (
                            <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600 border border-rose-100">
                                {errors.root.message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>

                        <div className="mt-6 rounded-lg bg-slate-50 p-4 text-xs text-slate-500 border border-slate-100">
                            <p className="font-semibold text-slate-700 mb-1">
                                Demo Credentials
                            </p>
                            <div className="space-y-1">
                                <p>
                                    Admin:{" "}
                                    <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">
                                        admin
                                    </code>{" "}
                                    /{" "}
                                    <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">
                                        admin123
                                    </code>
                                </p>
                                <p>
                                    Viewer:{" "}
                                    <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">
                                        viewer
                                    </code>{" "}
                                    /{" "}
                                    <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">
                                        viewer123
                                    </code>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="hidden lg:block relative bg-slate-900 p-12 text-white overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90"></div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">
                                Inventory Intelligence
                            </h2>
                            <p className="text-blue-100 text-lg leading-relaxed">
                                Real-time visibility into your stock, orders,
                                and fulfillment performance.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {liveStats.map((stat, index) => (
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
