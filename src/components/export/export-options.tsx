import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ExportSettings {
  format: 'png' | 'jpg' | 'svg'
  quality: number
  width: number
  height: number
  background: string
}

interface ExportOptionsProps {
  settings: ExportSettings
  onSettingsChange: (settings: ExportSettings) => void
}

export default function ExportOptions({ settings, onSettingsChange }: ExportOptionsProps) {
  const formatOptions = [
    { value: 'png', label: 'PNG', description: '支持透明背景，质量最佳' },
    { value: 'jpg', label: 'JPG', description: '文件较小，适合分享' },
    { value: 'svg', label: 'SVG', description: '矢量图，可无损缩放' },
  ]

  const presetSizes = [
    { name: '标准名片', width: 400, height: 600 },
    { name: '方形名片', width: 500, height: 500 },
    { name: '横版名片', width: 600, height: 400 },
    { name: '微信头像', width: 500, height: 500 },
    { name: '高清导出', width: 800, height: 1200 },
  ]

  const backgroundOptions = [
    { name: '白色', value: '#ffffff' },
    { name: '透明', value: 'transparent' },
    { name: '浅灰', value: '#f8f9fa' },
    { name: '品牌橙', value: '#FF6B35' },
    { name: '品牌蓝', value: '#4A90E2' },
  ]

  const updateSettings = (updates: Partial<ExportSettings>) => {
    onSettingsChange({ ...settings, ...updates })
  }

  return (
    <div className="space-y-6">
      {/* 格式选择 */}
      <Card>
        <CardHeader>
          <CardTitle>导出格式</CardTitle>
          <CardDescription>
            选择适合您需求的文件格式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {formatOptions.map((format) => (
              <button
                key={format.value}
                onClick={() => updateSettings({ format: format.value as any })}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${settings.format === format.value
                    ? 'border-brand-primary bg-brand-primary/5'
                    : 'border-gray-200 hover:border-brand-primary/50'
                  }
                `}
              >
                <h3 className={`font-medium mb-1 ${
                  settings.format === format.value ? 'text-brand-primary' : 'text-brand-dark'
                }`}>
                  {format.label}
                </h3>
                <p className="text-sm text-brand-gray">
                  {format.description}
                </p>
              </button>
            ))}
          </div>

          {/* JPG质量设置 */}
          {settings.format === 'jpg' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-brand-dark mb-2">
                图片质量: {Math.round(settings.quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={settings.quality}
                onChange={(e) => updateSettings({ quality: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-brand-gray mt-1">
                <span>较小文件</span>
                <span>最佳质量</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 尺寸设置 */}
      <Card>
        <CardHeader>
          <CardTitle>导出尺寸</CardTitle>
          <CardDescription>
            设置名片的导出尺寸
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 预设尺寸 */}
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">
              预设尺寸
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presetSizes.map((preset) => (
                <Button
                  key={preset.name}
                  variant={
                    settings.width === preset.width && settings.height === preset.height
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => updateSettings({ 
                    width: preset.width, 
                    height: preset.height 
                  })}
                  className="text-xs"
                >
                  {preset.name}
                  <br />
                  <span className="opacity-75">
                    {preset.width}×{preset.height}
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* 自定义尺寸 */}
          <div>
            <label className="block text-sm font-medium text-brand-dark mb-2">
              自定义尺寸 (像素)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-brand-gray mb-1">宽度</label>
                <Input
                  type="number"
                  value={settings.width}
                  onChange={(e) => updateSettings({ width: parseInt(e.target.value) || 400 })}
                  min="100"
                  max="2000"
                />
              </div>
              <div>
                <label className="block text-xs text-brand-gray mb-1">高度</label>
                <Input
                  type="number"
                  value={settings.height}
                  onChange={(e) => updateSettings({ height: parseInt(e.target.value) || 600 })}
                  min="100"
                  max="2000"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 背景设置 */}
      <Card>
        <CardHeader>
          <CardTitle>背景设置</CardTitle>
          <CardDescription>
            选择名片的背景颜色
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {backgroundOptions.map((bg) => (
              <button
                key={bg.value}
                onClick={() => updateSettings({ background: bg.value })}
                className={`
                  relative w-full h-16 rounded-lg border-2 flex flex-col items-center justify-center text-xs
                  ${settings.background === bg.value
                    ? 'border-brand-primary'
                    : 'border-gray-200 hover:border-brand-primary/50'
                  }
                `}
                style={{
                  backgroundColor: bg.value === 'transparent' ? 'white' : bg.value,
                  backgroundImage: bg.value === 'transparent' 
                    ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                    : undefined,
                  backgroundSize: bg.value === 'transparent' ? '8px 8px' : undefined,
                  backgroundPosition: bg.value === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined,
                }}
              >
                <span className={`font-medium ${
                  bg.value === '#ffffff' || bg.value === 'transparent' || bg.value === '#f8f9fa'
                    ? 'text-brand-dark'
                    : 'text-white'
                }`}>
                  {bg.name}
                </span>
                {settings.background === bg.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 自定义颜色 */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-brand-dark mb-2">
              自定义颜色
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.background === 'transparent' ? '#ffffff' : settings.background}
                onChange={(e) => updateSettings({ background: e.target.value })}
                className="w-12 h-10 rounded border border-gray-300"
              />
              <Input
                value={settings.background}
                onChange={(e) => updateSettings({ background: e.target.value })}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
