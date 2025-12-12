export default function LoadingSpinner({ size = "md", className = "" }) {
    const sizeClasses = {
        sm: "w-5 h-5",
        md: "w-8 h-8",
        lg: "w-12 h-12",
        xl: "w-16 h-16",
    };

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <div className="relative">
                {/* Outer glow */}
                <div
                    className={`
                        ${sizeClasses[size]}
                        absolute inset-0
                        rounded-full
                        bg-gradient-to-r from-primary-500 to-purple-500
                        blur-md opacity-40
                        animate-pulse
                    `}
                />
                {/* Main spinner */}
                <div
                    className={`
                        ${sizeClasses[size]}
                        relative
                        rounded-full
                        bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500
                        animate-spin
                    `}
                    style={{
                        maskImage: "conic-gradient(transparent 120deg, black)",
                        WebkitMaskImage:
                            "conic-gradient(transparent 120deg, black)",
                    }}
                />
                {/* Inner circle */}
                <div
                    className={`
                        absolute inset-1
                        rounded-full
                        bg-white
                    `}
                />
            </div>
        </div>
    );
}
