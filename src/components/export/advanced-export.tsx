import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AdvancedExportProps {
  onExport: (settings: any) => void
  exporting: boolean
}

export default function AdvancedExport({ onExport, exporting }: AdvancedExportProps) {
  const [customSettings, setCustomSettings] = useState({
    watermark: '',
    borderWidth: 0,
    borderColor: '#000000',
    padding: 20,
    shadow: false,
  })

  const watermarkOptions = [
    { value: '', label: '无水印' },
    { value: '51Talk', label: '51Talk Logo' },
    { value: 'Confidential', label: '机密' },
    { value: 'Draft', label: '草稿' },
  ]

  const handleQuickExport = (preset: string) => {
    const presets = {
      'print': {
        format: 'png' as const,
        quality: 1,
        width: 1200,
        height: 1800,
        background: '#ffffff',
        ...customSettings,
      },
      'social': {
        format: 'jpg' as const,
        quality: 0.9,
        width: 800,
        height: 1200,
        background: '#ffffff',
        ...customSettings,
      },
      'web': {
        format: 'png' as const,
        quality: 1,
        width: 600,
        height: 900,
        background: 'transparent',
        ...customSettings,
      },
      'mobile': {
        format: 'jpg' as const,
        quality: 0.8,
        width: 400,
        height: 600,
        background: '#ffffff',
        ...customSettings,
      },
    }

    onExport(presets[preset as keyof typeof presets])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>高级导出</CardTitle>
        <CardDescription>
          快速导出预设和自定义选项
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 快速导出预设 */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            快速导出预设
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleQuickExport('print')}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🖨️ 打印质量
            </Button>
            <Button
              onClick={() => handleQuickExport('social')}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              📱 社交媒体
            </Button>
            <Button
              onClick={() => handleQuickExport('web')}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              🌐 网页使用
            </Button>
            <Button
              onClick={() => handleQuickExport('mobile')}
              disabled={exporting}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              📲 移动端
            </Button>
          </div>
        </div>

        {/* 水印设置 */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            水印设置
          </label>
          <select
            value={customSettings.watermark}
            onChange={(e) => setCustomSettings({ ...customSettings, watermark: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          >
            {watermarkOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 边框设置 */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            边框设置
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-brand-gray mb-1">边框宽度</label>
              <Input
                type="number"
                value={customSettings.borderWidth}
                onChange={(e) => setCustomSettings({ 
                  ...customSettings, 
                  borderWidth: parseInt(e.target.value) || 0 
                })}
                min="0"
                max="20"
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-brand-gray mb-1">边框颜色</label>
              <input
                type="color"
                value={customSettings.borderColor}
                onChange={(e) => setCustomSettings({ 
                  ...customSettings, 
                  borderColor: e.target.value 
                })}
                className="w-full h-10 rounded border border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* 内边距设置 */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            内边距 (像素)
          </label>
          <Input
            type="number"
            value={customSettings.padding}
            onChange={(e) => setCustomSettings({ 
              ...customSettings, 
              padding: parseInt(e.target.value) || 0 
            })}
            min="0"
            max="100"
            className="text-sm"
          />
        </div>

        {/* 阴影效果 */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="shadow"
            checked={customSettings.shadow}
            onChange={(e) => setCustomSettings({ 
              ...customSettings, 
              shadow: e.target.checked 
            })}
            className="rounded"
          />
          <label htmlFor="shadow" className="text-sm text-brand-dark">
            添加阴影效果
          </label>
        </div>
      </CardContent>
    </Card>
  )
}


