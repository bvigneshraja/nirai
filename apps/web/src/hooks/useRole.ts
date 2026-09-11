import { useAuthStore } from '@/store/auth.store';

export function useRole() {
  const role = useAuthStore((s) => s.user?.role);
  return {
    role,
    isSuperAdmin: role === 'SUPER_ADMIN',
  };
}
