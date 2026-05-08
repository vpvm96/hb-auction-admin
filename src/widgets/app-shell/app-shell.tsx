import { Outlet } from 'react-router';
import { TopNav } from '@/widgets/top-nav/top-nav';
import { SideNav } from '@/widgets/side-nav/side-nav';

export function AppShell() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="flex items-start">
        <SideNav />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
