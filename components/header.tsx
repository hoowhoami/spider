'use client';

import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Settings, Bell, User } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  // 根据路径生成面包屑
  const getBreadcrumb = () => {
    if (pathname === '/') {
      return '工作流管理';
    }
    if (pathname.startsWith('/workflow/new')) {
      return '创建工作流';
    }
    if (pathname.startsWith('/workflow/')) {
      return '编辑工作流';
    }
    if (pathname === '/history') {
      return '执行历史';
    }
    if (pathname === '/settings') {
      return '设置';
    }
    return '工作流管理';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* 左侧：面包屑 */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">{getBreadcrumb()}</h2>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="通知">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" title="设置">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" title="用户">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
