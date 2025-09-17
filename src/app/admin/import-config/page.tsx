'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface ConfigItem {
  id: string
  name: string
  description: string
  config_data: any
  is_active: boolean
}

export default function ImportConfigPage() {
  const [configData, setConfigData] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null)
  const [previewData, setPreviewData] = useState<ConfigItem[]>([])

  const handlePreview = () => {
    try {
      const parsed = JSON.parse(configData)
      if (Array.isArray(parsed)) {
        setPreviewData(parsed)
        setResult({ success: true, message: `预览成功，共 ${parsed.length} 条配置` })
      } else {
        setResult({ success: false, message: '数据格式错误：应该是一个数组' })
      }
    } catch (error) {
      setResult({ success: false, message: 'JSON 格式错误：' + (error as Error).message })
    }
  }

  const handleImport = async () => {
    if (!configData.trim()) {
      setResult({ success: false, message: '请输入配置数据' })
      return
    }

    setImporting(true)
    try {
      const response = await fetch('/api/admin/import-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configData: JSON.parse(configData) })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({ 
          success: true, 
          message: `导入成功！共导入 ${data.count} 条配置`,
          count: data.count
        })
        setConfigData('')
        setPreviewData([])
      } else {
        setResult({ success: false, message: data.error || '导入失败' })
      }
    } catch (error) {
      setResult({ success: false, message: '导入失败：' + (error as Error).message })
    } finally {
      setImporting(false)
    }
  }

  const sampleConfig = [
    {
      id: 'layout_modern',
      name: '现代布局',
      description: '简洁现代的名片布局设计',
      config_data: {
        layout: 'modern',
        colors: ['#3B82F6', '#1E40AF'],
        fonts: ['Inter', 'system-ui'],
        spacing: 'comfortable'
      },
      is_active: true
    },
    {
      id: 'layout_classic',
      name: '经典布局',
      description: '传统经典的名片布局设计',
      config_data: {
        layout: 'classic',
        colors: ['#1F2937', '#374151'],
        fonts: ['Times New Roman', 'serif'],
        spacing: 'compact'
      },
      is_active: true
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">配置表导入工具</h1>
        <Badge variant="outline">管理员工具</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 导入配置 */}
        <Card>
          <CardHeader>
            <CardTitle>导入配置数据</CardTitle>
            <CardDescription>
              将配置表数据导入到 Supabase 数据库的 layout_configs 表中
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="config-data">配置数据 (JSON 格式)</Label>
              <Textarea
                id="config-data"
                placeholder="请粘贴 JSON 格式的配置数据..."
                value={configData}
                onChange={(e) => setConfigData(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handlePreview} 
                variant="outline"
                disabled={!configData.trim()}
              >
                预览数据
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={importing || !configData.trim()}
              >
                {importing ? '导入中...' : '导入配置'}
              </Button>
              <Button 
                onClick={() => setConfigData(JSON.stringify(sampleConfig, null, 2))}
                variant="secondary"
              >
                加载示例
              </Button>
            </div>

            {result && (
              <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* 数据预览 */}
        <Card>
          <CardHeader>
            <CardTitle>数据预览</CardTitle>
            <CardDescription>
              预览将要导入的配置数据
            </CardDescription>
          </CardHeader>
          <CardContent>
            {previewData.length > 0 ? (
              <div className="space-y-3">
                {previewData.map((item, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{item.name}</h4>
                      <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? '启用' : '禁用'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    <div className="text-xs text-gray-500">
                      ID: {item.id}
                    </div>
                    <details className="mt-2">
                      <summary className="text-xs cursor-pointer text-blue-600">查看配置详情</summary>
                      <pre className="text-xs mt-1 p-2 bg-white rounded border overflow-x-auto">
                        {JSON.stringify(item.config_data, null, 2)}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无预览数据</p>
                <p className="text-sm">请输入配置数据并点击"预览数据"</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <h4 className="font-medium">数据格式要求：</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>数据必须是 JSON 数组格式</li>
              <li>每个配置项必须包含：id, name, description, config_data, is_active 字段</li>
              <li>id 必须唯一，重复的 id 会被跳过</li>
              <li>config_data 可以是任意 JSON 对象</li>
            </ul>
          </div>
          
          <div className="text-sm space-y-2">
            <h4 className="font-medium">操作步骤：</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>准备符合格式的 JSON 配置数据</li>
              <li>粘贴到左侧文本框中</li>
              <li>点击"预览数据"检查格式是否正确</li>
              <li>确认无误后点击"导入配置"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}