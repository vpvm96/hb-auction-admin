import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { ROUTES } from '@/shared/config/routes';
import { useAuthStore } from '../model/auth-store';

// TEMP: backend /auth/login is not implemented yet — defaults are pre-filled
// with the dev credentials so a single click logs in. Remove once the real API exists.
const DEV_DEFAULTS = { email: 'admin', password: '1234' } as const;

const schema = z.object({
  email: z.string().min(1, '아이디를 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEV_DEFAULTS,
  });

  const onSubmit = (values: FormValues) => {
    setAuth({
      accessToken: 'mock-token',
      user: {
        id: 'mock',
        name: values.email.split('@')[0] || '관리자',
        email: values.email,
        role: 'super',
      },
    });
    const from = (location.state as { from?: string } | null)?.from ?? ROUTES.dashboard;
    navigate(from, { replace: true });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">아이디</Label>
        <Input
          id="email"
          type="text"
          autoComplete="username"
          placeholder="admin"
          {...form.register('email')}
        />
        {form.formState.errors.email ? (
          <p className="text-[11px] text-[var(--hb-red-700)]">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">비밀번호</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...form.register('password')}
        />
        {form.formState.errors.password ? (
          <p className="text-[11px] text-[var(--hb-red-700)]">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      <p className="rounded-md bg-[var(--hb-yellow-100)] px-3 py-2 text-[11px] text-[var(--hb-yellow-700)]">
        로그인 API 미구현 — 개발용 계정 <strong>admin / 1234</strong>가 미리 입력되어 있습니다.
      </p>

      <Button type="submit" className="mt-1">
        로그인
      </Button>
    </form>
  );
}
