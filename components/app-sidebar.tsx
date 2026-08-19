"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  FileText,
  LayoutDashboard,
  Radio,
  Tags,
  UserCog,
  Users,
} from "lucide-react"
import Link from "next/link"

import { NavMain } from "components/nav-main"
import { NavUser } from "components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "components/ui/sidebar"

export function AppSidebar({
  user,
  role,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
    avatar: string
  }
  // 当前登录用户的角色（来自 layout 的 session.user.role）
  // 只有 admin 才会显示「用户管理」入口
  role?: string
}) {
  const navMain = [
    { title: "首页", url: "/dashboard", icon: LayoutDashboard },
    { title: "发票", url: "/dashboard/invoices", icon: FileText },
    { title: "客户", url: "/dashboard/customers", icon: Users },
    { title: "SSE 实时推送", url: "/dashboard/sse-demo", icon: Radio },
    // RBAC：普通用户看不到这一项（UI 层显隐，方式 B —— role 从父组件 prop 接）
    ...(role === "admin"
      ? [{ title: "用户管理", url: "/dashboard/users", icon: UserCog }]
      : []),
    {title: "账单", url: "/dashboard/transactions", icon: ArrowUpCircleIcon},
    {title: "分类管理", url: "/dashboard/transactions/categories", icon: Tags},
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Acme</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
