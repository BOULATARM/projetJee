'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter();
  const { isAuthenticated, loadFromStorage, logout } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [requireAuth, isAuthenticated, router]);

  return { isAuthenticated, logout };
}
