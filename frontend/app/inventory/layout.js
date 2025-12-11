import { AuthProvider } from "@/inventory/contexts/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
    title: "Inventory Management System",
    description: "Instant delivery platform inventory management",
};

export default function RootLayout({ children }) {
    return (
        <AuthProvider>
            <div className="inventory-theme">
                {children}
                <Toaster position="top-right" />
            </div>
        </AuthProvider>
    );
}
