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
    if (abilities.teacherScreening) activeAbilities.push({
      text: textModules.teacherSelectionLabel,
      key: 'teacherSelectionLabel'
    })
    if (abilities.feedbackAbility) activeAbilities.push({
      text: textModules.progressFeedbackLabel,
      key: 'progressFeedbackLabel'
    })
    if (abilities.planningAbility) activeAbilities.push({
      text: textModules.planningLabel,
      key: 'planningLabel'
    })
    if (abilities.resourceSharing) activeAbilities.push({
      text: textModules.resourceSharingLabel,
      key: 'resourceSharingLabel'
    })
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

          {/* 数据统计 - 无边框横排显示 */}
          <div className="absolute top-72 left-1/2 transform -translate-x-1/2 flex gap-8">
            {/* 学员数量 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div 
                style={{
                  fontSize: `${textStyles?.studentsServed?.fontSize || 16}px`,
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
                className="text-[6px] leading-tight"
                style={{
                  color: textStyles?.studentsServed?.color || '#000000',
                  fontWeight: textStyles?.studentsServed?.fontWeight || 'normal'
                }}
              >
                STUDENTS<br />SERVED
              </div>
            </div>
            
            {/* 好评率 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div 
                style={{
                  fontSize: `${textStyles?.positiveRating?.fontSize || 16}px`,
                  color: textStyles?.positiveRating?.color || '#000000',
                  fontWeight: textStyles?.positiveRating?.fontWeight || 'bold'
                }}
              >
                {textModules.positiveRating}%
              </div>
              <div 
                className="text-[6px] leading-tight"
                style={{
                  color: textStyles?.positiveRating?.color || '#000000',
                  fontWeight: textStyles?.positiveRating?.fontWeight || 'normal'
                }}
              >
                POSITIVE<br />RATING
              </div>
            </div>
          </div>

          {/* 业务能力标签区域 - 无图标，英文两排显示 */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-80">
            <div className="grid grid-cols-2 gap-4 px-4">
              {/* 第一行：教师筛选和进度反馈 */}
              <div className="flex flex-col items-center text-center">
                <div 
                  className="leading-tight text-center"
                  style={{
                    fontSize: `${textStyles?.teacherSelectionLabel?.fontSize || 8}px`,
                    color: textStyles?.teacherSelectionLabel?.color || '#666666',
                    fontWeight: textStyles?.teacherSelectionLabel?.fontWeight || 'normal'
                  }}
                >
                  {(textModules.teacherSelectionLabel || 'Teacher\nSelection').split('\n').map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div 
                  className="leading-tight text-center"
                  style={{
                    fontSize: `${textStyles?.progressFeedbackLabel?.fontSize || 8}px`,
                    color: textStyles?.progressFeedbackLabel?.color || '#666666',
                    fontWeight: textStyles?.progressFeedbackLabel?.fontWeight || 'normal'
                  }}
                >
                  {(textModules.progressFeedbackLabel || 'Progress\nFeedback').split('\n').map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>

              {/* 第二行：学习计划和学习资源 */}
              <div className="flex flex-col items-center text-center">
                <div 
                  className="leading-tight text-center"
                  style={{
                    fontSize: `${textStyles?.planningLabel?.fontSize || 8}px`,
                    color: textStyles?.planningLabel?.color || '#666666',
                    fontWeight: textStyles?.planningLabel?.fontWeight || 'normal'
                  }}
                >
                  {(textModules.planningLabel || 'Study\nPlan').split('\n').map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center text-center">
                <div 
                  className="leading-tight text-center"
                  style={{
                    fontSize: `${textStyles?.resourceSharingLabel?.fontSize || 8}px`,
                    color: textStyles?.resourceSharingLabel?.color || '#666666',
                    fontWeight: textStyles?.resourceSharingLabel?.fontWeight || 'normal'
                  }}
                >
                  {(textModules.resourceSharingLabel || 'Learning\nResources').split('\n').map((line, index, array) => (
                    <span key={index}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

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
