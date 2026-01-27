'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WorkflowNode } from '@/lib/workflow-types';
import { X } from 'lucide-react';
import { zh } from '@/lib/i18n';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onUpdate: (nodeId: string, data: Partial<WorkflowNode['data']>) => void;
  onClose: () => void;
}

export function NodeConfigPanel({
  node,
  onUpdate,
  onClose,
}: NodeConfigPanelProps) {
  if (!node) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">{zh.panels.nodeConfig}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {zh.messages.selectNodeToConfig}
          </p>
        </CardContent>
      </Card>
    );
  }

  const updateData = (updates: Partial<WorkflowNode['data']>) => {
    onUpdate(node.id, updates);
  };

  const renderConfigFields = () => {
    switch (node.type) {
      case 'input':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="inputType">{zh.config.inputType}</Label>
              <Select
                value={(node.data as any).inputType || 'single'}
                onValueChange={(value) =>
                  updateData({
                    inputType: value as 'single' | 'multiple' | 'search',
                  })
                }
              >
                <SelectTrigger id="inputType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">{zh.config.singleUrl}</SelectItem>
                  <SelectItem value="multiple">
                    {zh.config.multipleUrls}
                  </SelectItem>
                  <SelectItem value="search">
                    {zh.config.searchQuery}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(node.data as any).inputType === 'single' && (
              <div className="space-y-2">
                <Label htmlFor="url">{zh.config.url}</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={(node.data as any).url || ''}
                  onChange={(e) => updateData({ url: e.target.value })}
                />
              </div>
            )}

            {(node.data as any).inputType === 'multiple' && (
              <div className="space-y-2">
                <Label htmlFor="urls">{zh.config.urls}</Label>
                <Textarea
                  id="urls"
                  placeholder="https://example1.com&#10;https://example2.com"
                  value={(node.data as any).urls?.join('\n') || ''}
                  onChange={(e) =>
                    updateData({ urls: e.target.value.split('\n') })
                  }
                  rows={5}
                />
              </div>
            )}

            {(node.data as any).inputType === 'search' && (
              <div className="space-y-2">
                <Label htmlFor="searchQuery">{zh.config.searchQuery}</Label>
                <Input
                  id="searchQuery"
                  placeholder={zh.config.query}
                  value={(node.data as any).searchQuery || ''}
                  onChange={(e) => updateData({ searchQuery: e.target.value })}
                />
              </div>
            )}
          </>
        );

      case 'ai-extract':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="extractionType">{zh.config.extractionType}</Label>
              <Select
                value={(node.data as any).extractionType || 'content'}
                onValueChange={(value) =>
                  updateData({ extractionType: value as any })
                }
              >
                <SelectTrigger id="extractionType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">{zh.config.content}</SelectItem>
                  <SelectItem value="structured">
                    {zh.config.structured}
                  </SelectItem>
                  <SelectItem value="links">{zh.config.links}</SelectItem>
                  <SelectItem value="analysis">{zh.config.analysis}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(node.data as any).extractionType === 'structured' && (
              <div className="space-y-2">
                <Label htmlFor="structuredFields">
                  {zh.config.structuredFields}
                </Label>
                <Input
                  id="structuredFields"
                  placeholder="title, price, description"
                  value={(node.data as any).structuredFields?.join(', ') || ''}
                  onChange={(e) =>
                    updateData({
                      structuredFields: e.target.value
                        .split(',')
                        .map((f) => f.trim()),
                    })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customPrompt">{zh.config.customPrompt}</Label>
              <Textarea
                id="customPrompt"
                placeholder={zh.config.customPrompt}
                value={(node.data as any).customPrompt || ''}
                onChange={(e) => updateData({ customPrompt: e.target.value })}
                rows={3}
              />
            </div>
          </>
        );

      case 'ai-analyze':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="analysisType">{zh.config.analysisType}</Label>
              <Select
                value={(node.data as any).analysisType || 'summary'}
                onValueChange={(value) =>
                  updateData({ analysisType: value as any })
                }
              >
                <SelectTrigger id="analysisType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">{zh.config.summary}</SelectItem>
                  <SelectItem value="sentiment">
                    {zh.config.sentiment}
                  </SelectItem>
                  <SelectItem value="classification">
                    {zh.config.classification}
                  </SelectItem>
                  <SelectItem value="custom">{zh.config.custom}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(node.data as any).analysisType === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="customPrompt">{zh.config.customPrompt}</Label>
                <Textarea
                  id="customPrompt"
                  placeholder={zh.config.customPrompt}
                  value={(node.data as any).customPrompt || ''}
                  onChange={(e) => updateData({ customPrompt: e.target.value })}
                  rows={3}
                />
              </div>
            )}
          </>
        );

      case 'ai-filter':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="filterType">{zh.config.filterType}</Label>
              <Select
                value={(node.data as any).filterType || 'keyword'}
                onValueChange={(value) =>
                  updateData({ filterType: value as any })
                }
              >
                <SelectTrigger id="filterType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">{zh.config.keyword}</SelectItem>
                  <SelectItem value="ai-condition">
                    {zh.config.aiCondition}
                  </SelectItem>
                  <SelectItem value="regex">{zh.config.regex}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(node.data as any).filterType === 'keyword' && (
              <div className="space-y-2">
                <Label htmlFor="keywords">{zh.config.keywords}</Label>
                <Input
                  id="keywords"
                  placeholder="keyword1, keyword2"
                  value={(node.data as any).keywords?.join(', ') || ''}
                  onChange={(e) =>
                    updateData({
                      keywords: e.target.value.split(',').map((k) => k.trim()),
                    })
                  }
                />
              </div>
            )}

            {(node.data as any).filterType === 'ai-condition' && (
              <div className="space-y-2">
                <Label htmlFor="condition">{zh.config.condition}</Label>
                <Textarea
                  id="condition"
                  placeholder={zh.config.condition}
                  value={(node.data as any).condition || ''}
                  onChange={(e) => updateData({ condition: e.target.value })}
                  rows={3}
                />
              </div>
            )}

            {(node.data as any).filterType === 'regex' && (
              <div className="space-y-2">
                <Label htmlFor="regex">{zh.config.regexPattern}</Label>
                <Input
                  id="regex"
                  placeholder="^https://.*"
                  value={(node.data as any).regex || ''}
                  onChange={(e) => updateData({ regex: e.target.value })}
                />
              </div>
            )}
          </>
        );

      case 'batch-crawl':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="maxDepth">{zh.config.maxDepth}</Label>
              <Input
                id="maxDepth"
                type="number"
                min="1"
                max="5"
                value={(node.data as any).maxDepth || 2}
                onChange={(e) =>
                  updateData({ maxDepth: parseInt(e.target.value) })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPages">{zh.config.maxPages}</Label>
              <Input
                id="maxPages"
                type="number"
                min="1"
                max="100"
                value={(node.data as any).maxPages || 10}
                onChange={(e) =>
                  updateData({ maxPages: parseInt(e.target.value) })
                }
              />
            </div>
          </>
        );

      case 'search-engine':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="searchEngine">{zh.config.searchEngine}</Label>
              <Select
                value={(node.data as any).searchEngine || 'google'}
                onValueChange={(value) =>
                  updateData({ searchEngine: value as any })
                }
              >
                <SelectTrigger id="searchEngine">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="bing">Bing</SelectItem>
                  <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="query">{zh.config.query}</Label>
              <Input
                id="query"
                placeholder={zh.config.query}
                value={(node.data as any).query || ''}
                onChange={(e) => updateData({ query: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxResults">{zh.config.maxResults}</Label>
              <Input
                id="maxResults"
                type="number"
                min="1"
                max="50"
                value={(node.data as any).maxResults || 10}
                onChange={(e) =>
                  updateData({ maxResults: parseInt(e.target.value) })
                }
              />
            </div>
          </>
        );

      case 'export':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="exportFormat">{zh.config.exportFormat}</Label>
              <Select
                value={(node.data as any).exportFormat || 'json'}
                onValueChange={(value) =>
                  updateData({ exportFormat: value as any })
                }
              >
                <SelectTrigger id="exportFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(node.data as any).exportFormat !== 'database' && (
              <div className="space-y-2">
                <Label htmlFor="filename">{zh.config.filename}</Label>
                <Input
                  id="filename"
                  placeholder="results"
                  value={(node.data as any).filename || ''}
                  onChange={(e) => updateData({ filename: e.target.value })}
                />
              </div>
            )}
          </>
        );

      case 'output':
        return (
          <div className="space-y-2">
            <Label htmlFor="outputType">{zh.config.outputType}</Label>
            <Select
              value={(node.data as any).outputType || 'display'}
              onValueChange={(value) =>
                updateData({ outputType: value as any })
              }
            >
              <SelectTrigger id="outputType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="display">{zh.config.display}</SelectItem>
                <SelectItem value="download">{zh.config.download}</SelectItem>
                <SelectItem value="api">{zh.config.api}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">{zh.panels.nodeConfig}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="label">{zh.config.label}</Label>
          <Input
            id="label"
            value={node.data.label}
            onChange={(e) => updateData({ label: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{zh.config.description}</Label>
          <Textarea
            id="description"
            value={node.data.description || ''}
            onChange={(e) => updateData({ description: e.target.value })}
            rows={2}
          />
        </div>

        {renderConfigFields()}
      </CardContent>
    </Card>
  );
}
