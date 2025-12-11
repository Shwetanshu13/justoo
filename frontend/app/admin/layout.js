import Providers from './providers';

export const metadata = {
    title: 'Admin Dashboard - Justoo',
    description: 'Super Admin Dashboard for managing inventory and admins',
};

export default function RootLayout({ children }) {
    return (
        <Providers>
            <div className="admin-theme">{children}</div>
        </Providers>
    );
}
