'use client';

import { Button } from '@/components/ui/button';
import { Terminal, PlayCircle, ChevronUp } from 'lucide-react';
import { zh } from '@/lib/i18n';

interface WorkflowStatusBarProps {
  onOpenLogs: () => void;
  onOpenResults: () => void;
  hasLogs: boolean;
  hasResults: boolean;
}

export function WorkflowStatusBar({
  onOpenLogs,
  onOpenResults,
  hasLogs,
  hasResults,
}: WorkflowStatusBarProps) {
  return (
    <div className="fixed bottom-0 left-64 right-0 z-40 flex h-8 items-center justify-between border-t bg-background px-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>AI Spider Workflow</span>
      </div>

      <div className="flex items-center gap-2">
        {hasLogs && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenLogs}
            className="h-6 gap-1 px-2 text-xs"
          >
            <Terminal className="h-3 w-3" />
            {zh.panels.executionLogs}
            <ChevronUp className="h-3 w-3" />
          </Button>
        )}
        {hasResults && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenResults}
            className="h-6 gap-1 px-2 text-xs"
          >
            <PlayCircle className="h-3 w-3" />
            {zh.panels.executionResults}
            <ChevronUp className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
