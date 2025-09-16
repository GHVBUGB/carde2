'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

interface ExportSettings {
  format: 'png' | 'jpg' | 'svg'
  quality: number
  scale: number
  width: number
  height: number
  backgroundColor: string
  removeBackground: boolean
  addWatermark: boolean
  addBorder: boolean
  borderColor: string
  borderWidth: number
  addShadow: boolean
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  shadowColor: string
}

interface AdvancedExportOptionsProps {
  settings: ExportSettings
  onSettingsChange: (settings: ExportSettings) => void
  onExport: () => void
  exporting: boolean
}

const PRESET_SIZES = [
  { name: '标准名片', width: 350, height: 500, ratio: '7:10' },
  { name: '高清名片', width: 700, height: 1000, ratio: '7:10' },
  { name: '方形名片', width: 500, height: 500, ratio: '1:1' },
  { name: '横版名片', width: 500, height: 300, ratio: '5:3' },
  { name: '大尺寸', width: 1050, height: 1500, ratio: '7:10' },
]

const BACKGROUND_COLORS = [
  { name: '白色', value: '#ffffff' },
  { name: '透明', value: 'transparent' },
  { name: '浅灰', value: '#f8f9fa' },
  { name: '浅蓝', value: '#e3f2fd' },
  { name: '浅黄', value: '#fff8e1' },
]

export default function AdvancedExportOptions({
  settings,
  onSettingsChange,
  onExport,
  exporting
}: AdvancedExportOptionsProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'effects'>('basic')

  const updateSetting = (key: keyof ExportSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    })
  }

  const applyPreset = (preset: typeof PRESET_SIZES[0]) => {
    updateSetting('width', preset.width)
    updateSetting('height', preset.height)
  }

  const getFileSizeEstimate = () => {
    const baseSize = settings.width * settings.height * settings.scale * settings.scale
    const formatMultiplier = settings.format === 'jpg' ? 0.1 : 0.3
    const qualityMultiplier = settings.format === 'jpg' ? settings.quality : 1
    const estimatedKB = Math.round((baseSize * formatMultiplier * qualityMultiplier) / 1024)
    return estimatedKB
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎨 高级导出设置
          <Badge variant="secondary">专业版</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 标签页导航 */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'basic'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            基础设置
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'advanced'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            高级选项
          </button>
          <button
            onClick={() => setActiveTab('effects')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'effects'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            视觉效果
          </button>
        </div>

        {/* 基础设置 */}
        {activeTab === 'basic' && (
          <div className="space-y-6">
            {/* 格式选择 */}
            <div className="space-y-2">
              <Label>导出格式</Label>
              <select 
                value={settings.format} 
                onChange={(e) => updateSetting('format', e.target.value as 'png' | 'jpg' | 'svg')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="png">PNG - 高质量，支持透明背景</option>
                <option value="jpg">JPG - 小文件，适合分享</option>
                <option value="svg">SVG - 矢量格式，无损缩放</option>
              </select>
            </div>

            {/* 尺寸预设 */}
            <div className="space-y-2">
              <Label>尺寸预设</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {PRESET_SIZES.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-sm">{preset.name}</div>
                    <div className="text-xs text-gray-500">{preset.width} × {preset.height}</div>
                    <div className="text-xs text-gray-400">{preset.ratio}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义尺寸 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>宽度 (px)</Label>
                <input
                  type="number"
                  value={settings.width}
                  onChange={(e) => updateSetting('width', parseInt(e.target.value) || 350)}
                  className="w-full px-3 py-2 border rounded-md"
                  min="100"
                  max="2000"
                />
              </div>
              <div className="space-y-2">
                <Label>高度 (px)</Label>
                <input
                  type="number"
                  value={settings.height}
                  onChange={(e) => updateSetting('height', parseInt(e.target.value) || 500)}
                  className="w-full px-3 py-2 border rounded-md"
                  min="100"
                  max="2000"
                />
              </div>
            </div>

            {/* 质量设置 */}
            {settings.format !== 'svg' && (
              <div className="space-y-2">
                <Label>质量: {Math.round(settings.quality * 100)}%</Label>
                <Slider
                  value={[settings.quality]}
                  onValueChange={([value]) => updateSetting('quality', value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}

            {/* 分辨率倍数 */}
            <div className="space-y-2">
              <Label>分辨率倍数: {settings.scale}x</Label>
              <Slider
                value={[settings.scale]}
                onValueChange={([value]) => updateSetting('scale', value)}
                min={1}
                max={5}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                更高倍数 = 更清晰但文件更大 (预计: {getFileSizeEstimate()}KB)
              </p>
            </div>
          </div>
        )}

        {/* 高级选项 */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            {/* 背景设置 */}
            <div className="space-y-2">
              <Label>背景颜色</Label>
              <div className="grid grid-cols-5 gap-2">
                {BACKGROUND_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => updateSetting('backgroundColor', color.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      settings.backgroundColor === color.value
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <div className="text-xs font-medium">{color.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 背景处理选项 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>移除背景图片</Label>
                  <p className="text-xs text-gray-500">导出时只保留纯色背景</p>
                </div>
                <Switch
                  checked={settings.removeBackground}
                  onCheckedChange={(checked) => updateSetting('removeBackground', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>添加水印</Label>
                  <p className="text-xs text-gray-500">在右下角添加51Talk水印</p>
                </div>
                <Switch
                  checked={settings.addWatermark}
                  onCheckedChange={(checked) => updateSetting('addWatermark', checked)}
                />
              </div>
            </div>
          </div>
        )}

        {/* 视觉效果 */}
        {activeTab === 'effects' && (
          <div className="space-y-6">
            {/* 边框设置 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>添加边框</Label>
                  <p className="text-xs text-gray-500">为名片添加装饰性边框</p>
                </div>
                <Switch
                  checked={settings.addBorder}
                  onCheckedChange={(checked) => updateSetting('addBorder', checked)}
                />
              </div>

              {settings.addBorder && (
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div className="space-y-2">
                    <Label>边框颜色</Label>
                    <input
                      type="color"
                      value={settings.borderColor}
                      onChange={(e) => updateSetting('borderColor', e.target.value)}
                      className="w-full h-10 border rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>边框宽度: {settings.borderWidth}px</Label>
                    <Slider
                      value={[settings.borderWidth]}
                      onValueChange={([value]) => updateSetting('borderWidth', value)}
                      min={1}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 阴影设置 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>添加阴影</Label>
                  <p className="text-xs text-gray-500">为名片添加立体阴影效果</p>
                </div>
                <Switch
                  checked={settings.addShadow}
                  onCheckedChange={(checked) => updateSetting('addShadow', checked)}
                />
              </div>

              {settings.addShadow && (
                <div className="grid grid-cols-2 gap-4 pl-4">
                  <div className="space-y-2">
                    <Label>阴影模糊: {settings.shadowBlur}px</Label>
                    <Slider
                      value={[settings.shadowBlur]}
                      onValueChange={([value]) => updateSetting('shadowBlur', value)}
                      min={0}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>阴影偏移X: {settings.shadowOffsetX}px</Label>
                    <Slider
                      value={[settings.shadowOffsetX]}
                      onValueChange={([value]) => updateSetting('shadowOffsetX', value)}
                      min={-20}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>阴影偏移Y: {settings.shadowOffsetY}px</Label>
                    <Slider
                      value={[settings.shadowOffsetY]}
                      onValueChange={([value]) => updateSetting('shadowOffsetY', value)}
                      min={-20}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>阴影颜色</Label>
                    <input
                      type="color"
                      value={settings.shadowColor}
                      onChange={(e) => updateSetting('shadowColor', e.target.value)}
                      className="w-full h-10 border rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 导出按钮 */}
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              预计文件大小: {getFileSizeEstimate()}KB
            </div>
            <Button
              onClick={onExport}
              disabled={exporting}
              className="px-8 py-2"
              size="lg"
            >
              {exporting ? '导出中...' : '开始导出'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
