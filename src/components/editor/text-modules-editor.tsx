'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface TextModule {
  id: string
  label: string
  value: string
  placeholder: string
  type: 'text' | 'number'
  category: 'basic' | 'stats' | 'contact' | 'abilities'
  maxLength?: number
  icon?: React.ReactNode
}

interface TextModulesEditorProps {
  textModules: {
    companyName: string
    name: string
    title: string
    studentsServed: number
    positiveRating: number
    phone: string
    // 业务能力标签文字
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

  // 定义所有文字模块
  const moduleDefinitions: TextModule[] = [
    // 基本信息模块
    {
      id: 'companyName',
      label: '公司/品牌名称',
      value: textModules.companyName,
      placeholder: '51Talk',
      type: 'text',
      category: 'basic',
      maxLength: 20,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'name',
      label: '姓名',
      value: textModules.name,
      placeholder: 'AHMED AL-FAWAZ',
      type: 'text',
      category: 'basic',
      maxLength: 30,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'title',
      label: '职位头衔',
      value: textModules.title,
      placeholder: 'SENIOR LANGUAGE COACH',
      type: 'text',
      category: 'basic',
      maxLength: 50,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },

    // 数据统计模块
    {
      id: 'studentsServed',
      label: '已服务学员数',
      value: textModules.studentsServed.toString(),
      placeholder: '5000',
      type: 'number',
      category: 'stats',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'positiveRating',
      label: '好评率 (%)',
      value: textModules.positiveRating.toString(),
      placeholder: '99',
      type: 'number',
      category: 'stats',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },

    // 联系方式模块
    {
      id: 'phone',
      label: '联系电话',
      value: textModules.phone,
      placeholder: '050-XXXX-XXAB',
      type: 'text',
      category: 'contact',
      maxLength: 20,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    },

    // 业务能力标签模块
    {
      id: 'teacherSelectionLabel',
      label: '外教筛选标签',
      value: textModules.teacherSelectionLabel,
      placeholder: 'Teacher Selection',
      type: 'text',
      category: 'abilities',
      maxLength: 30,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    },
    {
      id: 'progressFeedbackLabel',
      label: '学情反馈标签',
      value: textModules.progressFeedbackLabel,
      placeholder: 'Progress Feedback',
      type: 'text',
      category: 'abilities',
      maxLength: 30,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'planningLabel',
      label: '计划制定标签',
      value: textModules.planningLabel,
      placeholder: 'Progress Feedback',
      type: 'text',
      category: 'abilities',
      maxLength: 30,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: 'resourceSharingLabel',
      label: '学习资源标签',
      value: textModules.resourceSharingLabel,
      placeholder: 'Curriculum Learning Resources',
      type: 'text',
      category: 'abilities',
      maxLength: 40,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      )
    }
  ]

  // 分类配置
  const categories = [
    { id: 'basic', label: '基本信息', icon: '👤' },
    { id: 'stats', label: '数据统计', icon: '📊' },
    { id: 'contact', label: '联系方式', icon: '📞' },
    { id: 'abilities', label: '能力标签', icon: '🏷️' }
  ]

  // 获取当前分类的模块
  const currentCategoryModules = moduleDefinitions.filter(
    module => module.category === activeCategory
  )

  // 处理输入变化
  const handleInputChange = (moduleId: string, value: string) => {
    const module = moduleDefinitions.find(m => m.id === moduleId)
    if (!module) return

    // 检查字符限制
    if (module.maxLength && value.length > module.maxLength) {
      return
    }

    // 数字类型验证
    if (module.type === 'number') {
      const numValue = parseInt(value) || 0
      onTextModulesChange({ [moduleId]: numValue })
    } else {
      onTextModulesChange({ [moduleId]: value })
    }
  }

  // 处理样式变化
  const handleStyleChange = (moduleId: string, styleProperty: string, value: any) => {
    onTextStylesChange({
      [moduleId]: {
        ...textStyles[moduleId as keyof typeof textStyles],
        [styleProperty]: value
      }
    })
  }

  // 重置为默认值
  const resetToDefaults = () => {
    const defaults = {
      companyName: '51Talk',
      name: 'AHMED AL-FAWAZ',
      title: 'SENIOR LANGUAGE COACH',
      studentsServed: 5000,
      positiveRating: 99,
      phone: '050-XXXX-XXAB',
      teacherSelectionLabel: 'Teacher Selection',
      progressFeedbackLabel: 'Progress Feedback',
      planningLabel: 'Progress Feedback',
      resourceSharingLabel: 'Curriculum Learning Resources'
    }
    onTextModulesChange(defaults)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          文字模块编辑
        </CardTitle>
        <CardDescription>
          自定义名片上显示的所有文字内容，支持多语言和个性化标签
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 分类标签页 */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeCategory === category.id
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-gray-100 text-brand-gray hover:bg-gray-200'
                }
              `}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* 当前分类的文字模块 */}
        <div className="space-y-6">
          {currentCategoryModules.map((module) => {
            const currentStyle = textStyles[module.id as keyof typeof textStyles]
            
            return (
              <div key={module.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <label className="flex items-center gap-2 text-sm font-medium text-brand-dark">
                  {module.icon}
                  {module.label}
                  {module.maxLength && (
                    <span className="text-xs text-brand-gray">
                      ({module.value.length}/{module.maxLength})
                    </span>
                  )}
                </label>
                
                {/* 文字内容输入 */}
                <div className="relative">
                  <Input
                    type={module.type}
                    value={module.value}
                    onChange={(e) => handleInputChange(module.id, e.target.value)}
                    placeholder={module.placeholder}
                    className={`
                      pr-20
                      ${module.maxLength && module.value.length > module.maxLength * 0.8 
                        ? 'border-yellow-300 focus:border-yellow-400' 
                        : ''
                      }
                    `}
                  />
                  
                  {/* 字符计数器 */}
                  {module.maxLength && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <span className={`
                        text-xs
                        ${module.value.length > module.maxLength * 0.8
                          ? 'text-yellow-600'
                          : 'text-gray-400'
                        }
                      `}>
                        {module.value.length}/{module.maxLength}
                      </span>
                    </div>
                  )}
                </div>

                {/* 字体样式控制 */}
                <div className="grid grid-cols-3 gap-3">
                  {/* 字体大小 */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">字体大小</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="8"
                        max="32"
                        value={currentStyle?.fontSize || 14}
                        onChange={(e) => handleStyleChange(module.id, 'fontSize', parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-xs text-gray-500 w-8">{currentStyle?.fontSize || 14}px</span>
                    </div>
                  </div>
                  
                  {/* 颜色选择 */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">文字颜色</label>
                    <input
                      type="color"
                      value={currentStyle?.color || '#000000'}
                      onChange={(e) => handleStyleChange(module.id, 'color', e.target.value)}
                      className="w-full h-8 rounded border border-gray-200"
                    />
                  </div>
                  
                  {/* 字体粗细 */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">字体粗细</label>
                    <select
                      value={currentStyle?.fontWeight || 'normal'}
                      onChange={(e) => handleStyleChange(module.id, 'fontWeight', e.target.value)}
                      className="w-full h-8 px-2 border border-gray-200 rounded text-xs"
                    >
                      <option value="normal">正常</option>
                      <option value="bold">粗体</option>
                      <option value="lighter">细体</option>
                    </select>
                  </div>
                </div>

                {/* 预览效果 */}
                <div className="p-3 bg-gray-50 rounded border">
                  <div className="text-xs text-gray-600 mb-2">预览效果:</div>
                  <div 
                    style={{
                      fontSize: `${currentStyle?.fontSize || 14}px`,
                      color: currentStyle?.color || '#000000',
                      fontWeight: currentStyle?.fontWeight || 'normal'
                    }}
                  >
                    {module.value || module.placeholder}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 快捷操作 */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            恢复默认
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: 实现导入功能
            }}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            导入模板
          </Button>
        </div>

        {/* 使用说明 */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">使用提示</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 点击不同的分类标签切换编辑内容</li>
                <li>• 文字长度有限制，请注意字符计数器提示</li>
                <li>• 修改后会在右侧预览中实时更新</li>
                <li>• 支持中英文混合输入</li>
                <li>• 点击"恢复默认"可以重置为示例文字</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
