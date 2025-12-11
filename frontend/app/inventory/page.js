'use client';

import { useEffect } from 'react';
import { useAuth } from '@/inventory/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/inventory/components/LoadingSpinner';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/inventory/dashboard');
      } else {
        router.push('/inventory/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return null;
}
