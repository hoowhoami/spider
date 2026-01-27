'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Workflow } from '@/lib/workflow-types';
import { zh } from '@/lib/i18n';

interface TemplatePanelProps {
  onClose: () => void;
  onUseTemplate: (template: Workflow) => void;
}

export function TemplatePanel({ onClose, onUseTemplate }: TemplatePanelProps) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error(zh.errors.loadTemplateFailed, error);
    } finally {
      setLoading(false);
    }
  };

  // 按分类分组
  const groupedTemplates = templates.reduce(
    (acc, template) => {
      const category = template.category || zh.common.uncategorized;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    },
    {} as Record<string, any[]>
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">{zh.templatePanel.title}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">{zh.common.loading}</p>
          ) : templates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {zh.templatePanel.noTemplates}
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedTemplates).map(
                ([category, categoryTemplates]) => (
                  <div key={category}>
                    <h3 className="mb-2 text-sm font-semibold">{category}</h3>
                    <div className="space-y-2">
                      {(categoryTemplates as any[]).map((template) => (
                        <Card
                          key={template.id}
                          className="cursor-pointer overflow-hidden transition-colors hover:border-primary"
                          onClick={() => onUseTemplate(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                              <div className="min-w-0 flex-1">
                                <div className="truncate font-medium">
                                  {template.name}
                                </div>
                                {template.description && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {template.description}
                                  </p>
                                )}
                                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                                  <span>
                                    {template.nodes.length}{' '}
                                    {zh.common.nodesCount}
                                  </span>
                                  <span>
                                    {template.edges.length}{' '}
                                    {zh.common.connectionsCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
