'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TextModulesEditorProps {
  textModules: {
    companyName: string
    name: string
    title: string
    studentsServed: number
    positiveRating: number
    phone: string
    teacherSelectionLabel: string
    progressFeedbackLabel: string
    planningLabel: string
    resourceSharingLabel: string
  }
  textStyles: {
    companyName: { fontSize: number; color: string; fontWeight: string }
    name: { fontSize: number; color: string; fontWeight: string }
    title: { fontSize: number; color: string; fontWeight: string }
    studentsServed: { fontSize: number; color: string; fontWeight: string }
    positiveRating: { fontSize: number; color: string; fontWeight: string }
    phone: { fontSize: number; color: string; fontWeight: string }
    teacherSelectionLabel: { fontSize: number; color: string; fontWeight: string }
    progressFeedbackLabel: { fontSize: number; color: string; fontWeight: string }
    planningLabel: { fontSize: number; color: string; fontWeight: string }
    resourceSharingLabel: { fontSize: number; color: string; fontWeight: string }
  }
  onTextModulesChange: (updates: Partial<TextModulesEditorProps['textModules']>) => void
  onTextStylesChange: (updates: Partial<TextModulesEditorProps['textStyles']>) => void
}

export default function TextModulesEditor({ 
  textModules, 
  textStyles, 
  onTextModulesChange, 
  onTextStylesChange 
}: TextModulesEditorProps) {
  const [activeCategory, setActiveCategory] = useState<string>('basic')

  const handleTextChange = (id: string, value: string | number) => {
    onTextModulesChange({ [id]: value })
  }

  const handleStyleChange = (id: string, styleType: 'fontSize' | 'color' | 'fontWeight', value: string | number) => {
    onTextStylesChange({
      [id]: {
        ...textStyles[id as keyof typeof textStyles],
        [styleType]: value
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* 基本信息编辑 */}
      <Card className="p-4">
        <h3 className="font-medium text-sm mb-4">基本信息</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 姓名 */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600">姓名</label>
            <Input
              value={textModules.name}
              onChange={(e) => handleTextChange('name', e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-600">字体大小</label>
                <input
                  type="range"
                  min="12"
                  max="32"
                  value={textStyles.name?.fontSize || 20}
                  onChange={(e) => handleStyleChange('name', 'fontSize', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">颜色</label>
                <input
                  type="color"
                  value={textStyles.name?.color || '#000000'}
                  onChange={(e) => handleStyleChange('name', 'color', e.target.value)}
                  className="w-full h-8 rounded border"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">粗细</label>
                <select
                  value={textStyles.name?.fontWeight || 'bold'}
                  onChange={(e) => handleStyleChange('name', 'fontWeight', e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                </select>
              </div>
            </div>
          </div>

          {/* 职位 */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600">职位头衔</label>
            <select
              value={textModules.title}
              onChange={(e) => handleTextChange('title', e.target.value)}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
            >
              <option value="">请选择职位</option>
              <option value="首席成长伙伴">首席成长伙伴</option>
              <option value="金牌成长顾问">金牌成长顾问</option>
              <option value="五星服务官">五星服务官</option>
              <option value="学习领航官">学习领航官</option>
            </select>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-600">字体大小</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={textStyles.title?.fontSize || 14}
                  onChange={(e) => handleStyleChange('title', 'fontSize', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">颜色</label>
                <input
                  type="color"
                  value={textStyles.title?.color || '#666666'}
                  onChange={(e) => handleStyleChange('title', 'color', e.target.value)}
                  className="w-full h-8 rounded border"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">粗细</label>
                <select
                  value={textStyles.title?.fontWeight || 'normal'}
                  onChange={(e) => handleStyleChange('title', 'fontWeight', e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                </select>
              </div>
            </div>
          </div>

          {/* 服务人数 */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600">已服务学员数</label>
            <Input
              type="number"
              min="0"
              max="5000"
              value={textModules.studentsServed || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/^0+/, '') || '0'
                const numValue = Number(value)
                if (numValue <= 5000) {
                  handleTextChange('studentsServed', numValue)
                }
              }}
              placeholder="请输入服务人数（最多5000人）"
              className="w-full"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-600">字体大小</label>
                <input
                  type="range"
                  min="8"
                  max="20"
                  value={textStyles.studentsServed?.fontSize || 12}
                  onChange={(e) => handleStyleChange('studentsServed', 'fontSize', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">颜色</label>
                <input
                  type="color"
                  value={textStyles.studentsServed?.color || '#000000'}
                  onChange={(e) => handleStyleChange('studentsServed', 'color', e.target.value)}
                  className="w-full h-8 rounded border"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">粗细</label>
                <select
                  value={textStyles.studentsServed?.fontWeight || 'bold'}
                  onChange={(e) => handleStyleChange('studentsServed', 'fontWeight', e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                </select>
              </div>
            </div>
          </div>

          {/* 好评率 */}
          <div className="space-y-2">
            <label className="text-xs text-gray-600">好评率 (%)</label>
            <Input
              type="number"
              min="0"
              max="99"
              value={textModules.positiveRating || ''}
              onChange={(e) => {
                const value = e.target.value.replace(/^0+/, '') || '0'
                const numValue = Number(value)
                if (numValue <= 99) {
                  handleTextChange('positiveRating', numValue)
                }
              }}
              placeholder="请输入好评率（最多99%）"
              className="w-full"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-600">字体大小</label>
                <input
                  type="range"
                  min="8"
                  max="20"
                  value={textStyles.positiveRating?.fontSize || 12}
                  onChange={(e) => handleStyleChange('positiveRating', 'fontSize', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">颜色</label>
                <input
                  type="color"
                  value={textStyles.positiveRating?.color || '#000000'}
                  onChange={(e) => handleStyleChange('positiveRating', 'color', e.target.value)}
                  className="w-full h-8 rounded border"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">粗细</label>
                <select
                  value={textStyles.positiveRating?.fontWeight || 'bold'}
                  onChange={(e) => handleStyleChange('positiveRating', 'fontWeight', e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                </select>
              </div>
            </div>
      </div>
      
          {/* 联系电话 */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs text-gray-600">联系电话</label>
            <Input
              value={textModules.phone}
              onChange={(e) => handleTextChange('phone', e.target.value)}
              placeholder="请输入联系电话"
              className="w-full"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-600">字体大小</label>
                <input
                  type="range"
                  min="10"
                  max="20"
                  value={textStyles.phone?.fontSize || 14}
                  onChange={(e) => handleStyleChange('phone', 'fontSize', Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">颜色</label>
                <input
                  type="color"
                  value={textStyles.phone?.color || '#000000'}
                  onChange={(e) => handleStyleChange('phone', 'color', e.target.value)}
                  className="w-full h-8 rounded border"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">粗细</label>
                <select
                  value={textStyles.phone?.fontWeight || 'bold'}
                  onChange={(e) => handleStyleChange('phone', 'fontWeight', e.target.value)}
                  className="w-full text-xs border rounded px-2 py-1"
                >
                  <option value="normal">正常</option>
                  <option value="bold">粗体</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>

    </div>
  )
}