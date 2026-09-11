import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginInput } from '@nirai/schemas';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const res = await api.post('/auth/login', data, { baseURL: '/' });
      setAuth(res.data.token, res.data.user);
      navigate('/');
    } catch {
      setError('password', { message: 'Invalid email or password' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F2F7' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo block */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/nirai-logo.svg"
            alt="Nirai"
            style={{
              width: 72, height: 72, borderRadius: 18,
              marginBottom: 16,
              boxShadow: '0 8px 28px rgba(0,80,213,0.30)',
              display: 'block', margin: '0 auto 16px',
            }}
          />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1C1C1E', margin: 0, letterSpacing: '-0.5px' }}>
            Nirai
          </h1>
          <p style={{ fontSize: 15, color: '#8E8E93', marginTop: 4 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 18, padding: '28px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              loading={isSubmitting}
              style={{ width: '100%', marginTop: 4, justifyContent: 'center', padding: '13px 20px', fontSize: 17, borderRadius: 12, fontWeight: 600 }}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
