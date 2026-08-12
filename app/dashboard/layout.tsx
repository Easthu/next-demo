import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { auth } from '@/auth';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = {
    name: session?.user?.name || 'User',
    email: session?.user?.email || '',
    avatar: session?.user?.image || '',
  };
  // 从 session 取 role，往下传给侧边栏（决定「用户管理」入口显隐）
  const role = session?.user?.role;

  return (
    <SidebarProvider>
      <AppSidebar user={user} role={role} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
