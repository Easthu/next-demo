import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      console.log('auth:', auth);
      console.log('nextUrl:', nextUrl);
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      // 用户管理页（/dashboard/users）只有 admin 能进
      // 注意：这里的 auth.user.role 来自 token —— 必须等 jwt 回调把 role 塞进 token 后才有值
      const isOnUsersPage = nextUrl.pathname.startsWith('/dashboard/users');
      if (isOnUsersPage && auth?.user?.role !== 'admin') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // 未登录用户重定向到登录页
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    // ───────────────────────────────────────────────────────────
    // ⭐ 核心考点：把数据库里的 role 搬进 session（两棒接力）
    // ───────────────────────────────────────────────────────────
    // 第一棒：登录时把 user.role 存进 token（token 会加密存进 cookie）
    // user 参数只在「登录那一刻」有值，之后每次请求都是 undefined
    async jwt({ token, user }) {
      // 诊断用：登录时 user 有值，看 role 有没有拿到
      console.log('[jwt 回调]', user?.email ?? '(无user,非登录)', '| user.role =', user?.role ?? '(无)');
      if (user) token.role = user.role;
      return token;
    },
    // 第二棒：把 token 里的 role 搬到 session.user 上（组件/页面才能读到）
    // 每次 auth() 被调用时触发
    async session({ session, token }) {
      // token.role 在运行时一定有值（jwt 回调已写入），但 TS 推断成 unknown
      // （@auth/core 的 JWT 是间接依赖，pnpm 隔离导致无法用 declare module 扩展类型）
      // 所以这里 cast 成 string。这是 NextAuth v5 + pnpm 的已知妥协。
      if (session.user) session.user.role = token.role as string;
      return session;
    },
  },
  providers: [], // 暂时用空数组，之后再添加提供者
} satisfies NextAuthConfig;