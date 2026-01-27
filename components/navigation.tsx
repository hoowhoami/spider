'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Workflow, Home, Plus } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();
  const isWorkflowEditor = pathname.startsWith('/workflow/');

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Workflow className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">AI Spider</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/">
            <Button
              variant={pathname === '/' ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              工作流列表
            </Button>
          </Link>
          <Link href="/workflow/new">
            <Button
              variant={isWorkflowEditor ? 'default' : 'ghost'}
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              创建工作流
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
