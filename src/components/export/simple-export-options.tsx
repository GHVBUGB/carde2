'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ExportSettings {
  format: 'png' | 'jpg'
  quality: number
  scale: number
  width: number
  height: number
  backgroundColor: string
}

interface SimpleExportOptionsProps {
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
]

const BACKGROUND_COLORS = [
  { name: '白色', value: '#ffffff' },
  { name: '透明', value: 'transparent' },
  { name: '浅灰', value: '#f8f9fa' },
  { name: '浅蓝', value: '#e3f2fd' },
]

export default function SimpleExportOptions({
  settings,
  onSettingsChange,
  onExport,
  exporting
}: SimpleExportOptionsProps) {
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎨 导出设置
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 格式选择 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">导出格式</label>
          <select 
            value={settings.format} 
            onChange={(e) => updateSetting('format', e.target.value as 'png' | 'jpg')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="png">PNG - 高质量，支持透明背景</option>
            <option value="jpg">JPG - 小文件，适合分享</option>
          </select>
        </div>

        {/* 尺寸预设 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">尺寸预设</label>
          <div className="grid grid-cols-2 gap-2">
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
            <label className="text-sm font-medium">宽度 (px)</label>
            <input
              type="number"
              value={settings.width}
              onChange={(e) => updateSetting('width', parseInt(e.target.value) || 350)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="100"
              max="2000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">高度 (px)</label>
            <input
              type="number"
              value={settings.height}
              onChange={(e) => updateSetting('height', parseInt(e.target.value) || 500)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="100"
              max="2000"
            />
          </div>
        </div>

        {/* 质量设置 */}
        {settings.format === 'jpg' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">质量: {Math.round(settings.quality * 100)}%</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.quality}
              onChange={(e) => updateSetting('quality', parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        )}

        {/* 分辨率倍数 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">分辨率倍数: {settings.scale}x</label>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={settings.scale}
            onChange={(e) => updateSetting('scale', parseFloat(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            更高倍数 = 更清晰但文件更大 (预计: {getFileSizeEstimate()}KB)
          </p>
        </div>

        {/* 背景设置 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">背景颜色</label>
          <div className="grid grid-cols-4 gap-2">
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
            >
              {exporting ? '导出中...' : '开始导出'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
