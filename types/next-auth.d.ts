// NextAuth 类型扩展
// ─────────────────────────────────────────────────────────────
// 为什么需要这个文件？
// NextAuth 默认只认 session.user 上的 name / email / image 三个字段。
// 我们加了 role，但 TS 不知道 session.user 上有 role —— 写 session.user.role 会报红。
// 这个文件就是"告诉编译器：User / Session / JWT 上都有个 role 字段"。
//
// 注意：它只影响 TypeScript 类型，没有任何运行时作用。
// 真正把 role 塞进 session 的，是 auth.config.ts 里的 jwt/session 回调。
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  // 登录用户对象的类型（authorize 返回的、jwt 回调里的 user）
  interface User {
    role?: string; // 'admin' | 'user'
  }
  // auth() 拿到的 session 类型
  interface Session {
    user: {
      role?: string;
    } & DefaultSession['user'];
  }
}

// ⚠️ 为什么没有扩展 JWT（token）类型？
// next-auth v5 的 JWT 真身在 @auth/core/jwt，但 @auth/core 是 next-auth 的间接依赖，
// 被 pnpm 隔离（项目顶层 node_modules 里没有它）。所以 `declare module '@auth/core/jwt'`
// 补丁合并不到真实 JWT 上，token.role 会被推断成 unknown。
// 务实解法：在 session 回调里读 token.role 时 cast 成 string（见 auth.config.ts）。
// Session / User 这两个扩展是生效的（next-auth 是直接依赖，可正常合并）。
