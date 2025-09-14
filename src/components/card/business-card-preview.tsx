'use client'

import { User } from '@/lib/types'
import { useState, useRef } from 'react'

interface TextModules {
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

interface TextStyles {
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

interface BusinessCardPreviewProps {
  user: User
  textModules: TextModules
  textStyles?: TextStyles
  abilities: {
    teacherScreening: boolean
    feedbackAbility: boolean
    planningAbility: boolean
    resourceSharing: boolean
  }
  className?: string
  backgroundImage?: string
  onBackgroundUpload?: (file: File) => void
}

export default function BusinessCardPreview({ 
  user, 
  textModules,
  textStyles,
  abilities,
  className, 
  backgroundImage = '/ditu.png',
  onBackgroundUpload 
}: BusinessCardPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理背景图上传
  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && onBackgroundUpload) {
      onBackgroundUpload(file)
    }
  }

  // 获取启用的能力标签
  const getActiveAbilities = () => {
    const activeAbilities = []
    if (abilities.teacherScreening) activeAbilities.push(textModules.teacherSelectionLabel)
    if (abilities.feedbackAbility) activeAbilities.push(textModules.progressFeedbackLabel)
    if (abilities.planningAbility) activeAbilities.push(textModules.planningLabel)
    if (abilities.resourceSharing) activeAbilities.push(textModules.resourceSharingLabel)
    return activeAbilities
  }

  const activeAbilities = getActiveAbilities()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 工具栏 */}
      <div className="flex gap-2 p-3 bg-gray-100 rounded-lg">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          上传底图
        </button>
        <button
          onClick={() => {
            // TODO: 实现导出功能
            console.log('导出名片')
          }}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
        >
          导出名片
        </button>
      </div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleBackgroundUpload}
        className="hidden"
      />

      {/* 名片画布 - 基于图片设计 */}
      <div className="relative">
        <div 
          className="relative w-[350px] h-[500px] mx-auto border border-gray-300 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* 品牌标识 - 左上角 */}
          <div className="absolute top-4 left-4">
            <div 
              style={{
                fontSize: `${textStyles?.companyName?.fontSize || 14}px`,
                color: textStyles?.companyName?.color || '#ffffff',
                fontWeight: textStyles?.companyName?.fontWeight || 'bold'
              }}
            >
              {textModules.companyName}
            </div>
          </div>

          {/* 头像 - 中上部位置 */}
          {user.avatar_url && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={user.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* 姓名 - 头像下方 */}
          <div className="absolute top-44 left-1/2 transform -translate-x-1/2 text-center">
            <h1 
              className="mb-1"
              style={{
                fontSize: `${textStyles?.name?.fontSize || 20}px`,
                color: textStyles?.name?.color || '#000000',
                fontWeight: textStyles?.name?.fontWeight || 'bold'
              }}
            >
              {textModules.name || user.name || 'AHMED AL-FAWAZ'}
            </h1>
            {/* 职位头衔 */}
            <p 
              style={{
                fontSize: `${textStyles?.title?.fontSize || 14}px`,
                color: textStyles?.title?.color || '#666666',
                fontWeight: textStyles?.title?.fontWeight || 'normal'
              }}
            >
              {textModules.title || user.title || 'SENIOR LANGUAGE COACH'}
            </p>
          </div>

          {/* 数据统计圆形标签 - 中间位置 */}
          <div className="absolute top-72 left-1/2 transform -translate-x-1/2 flex gap-4">
            {/* 学员数量 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div 
                style={{
                  fontSize: `${textStyles?.studentsServed?.fontSize || 12}px`,
                  color: textStyles?.studentsServed?.color || '#000000',
                  fontWeight: textStyles?.studentsServed?.fontWeight || 'bold'
                }}
              >
                {textModules.studentsServed >= 1000 
                  ? `${Math.floor(textModules.studentsServed / 1000)}K+`
                  : textModules.studentsServed
                }
              </div>
              <div 
                className="text-[8px] leading-tight"
                style={{
                  color: textStyles?.studentsServed?.color || '#000000'
                }}
              >
                STUDENTS<br />SERVED
              </div>
            </div>
            
            {/* 好评率 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div 
                style={{
                  fontSize: `${textStyles?.positiveRating?.fontSize || 12}px`,
                  color: textStyles?.positiveRating?.color || '#000000',
                  fontWeight: textStyles?.positiveRating?.fontWeight || 'bold'
                }}
              >
                {textModules.positiveRating}%
              </div>
              <div 
                className="text-[8px] leading-tight"
                style={{
                  color: textStyles?.positiveRating?.color || '#000000'
                }}
              >
                POSITIVE<br />RATING
              </div>
            </div>
          </div>

          {/* 业务能力图标区域 - 下方 */}
          {activeAbilities.length > 0 && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-80">
              <div className="grid grid-cols-4 gap-2 px-4">
                {activeAbilities.slice(0, 4).map((ability, index) => {
                  const icons = [
                    // Teacher Selection
                    <svg key="teacher" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>,
                    // Progress Feedback  
                    <svg key="feedback" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>,
                    // Planning
                    <svg key="planning" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>,
                    // Resource Sharing
                    <svg key="resource" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ]

                  // 获取对应的样式键
                  const styleKeys = ['teacherSelectionLabel', 'progressFeedbackLabel', 'planningLabel', 'resourceSharingLabel']
                  const styleKey = styleKeys[index] as keyof typeof textStyles

                  return (
                    <div key={index} className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 flex items-center justify-center mb-1"
                           style={{ color: textStyles?.[styleKey]?.color || '#000000' }}>
                        {icons[index] || icons[0]}
                      </div>
                      <div 
                        className="leading-tight max-w-16"
                        style={{
                          fontSize: `${textStyles?.[styleKey]?.fontSize || 8}px`,
                          color: textStyles?.[styleKey]?.color || '#000000',
                          fontWeight: textStyles?.[styleKey]?.fontWeight || 'normal'
                        }}
                      >
                        {ability}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 联系方式 - 底部 */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="text-center">
              <span 
                style={{
                  fontSize: `${textStyles?.phone?.fontSize || 14}px`,
                  color: textStyles?.phone?.color || '#000000',
                  fontWeight: textStyles?.phone?.fontWeight || 'bold'
                }}
              >
                电话: {textModules.phone || user.phone || '050-XXXX-XXAB'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• 点击"上传底图"更换背景图片</p>
        <p>• 在左侧编辑区域修改文字内容</p>
        <p>• 选择业务能力会在名片上显示对应图标</p>
        <p>• 点击"导出名片"下载高清图片</p>
      </div>
    </div>
  )
}
