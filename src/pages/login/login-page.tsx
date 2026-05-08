import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { LoginForm } from '@/features/auth/ui/login-form';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <img src="/logo.png" alt="HB Auction" className="h-9 w-auto object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight text-[#1F3B5C]">HB Auction</span>
            <span className="mt-0.5 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground">
              ADMIN CONSOLE
            </span>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>관리자 로그인</CardTitle>
            <CardDescription>내부 관리자 계정으로 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
