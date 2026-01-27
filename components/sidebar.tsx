'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Workflow,
  Home,
  Plus,
  History,
  Settings,
  LayoutDashboard,
} from 'lucide-react';

const menuItems = [
  {
    title: '工作流管理',
    icon: LayoutDashboard,
    href: '/',
    exact: true,
  },
  {
    title: '创建工作流',
    icon: Plus,
    href: '/workflow/new',
  },
  {
    title: '执行历史',
    icon: History,
    href: '/history',
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (item: (typeof menuItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Workflow className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold">AI Spider</h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
